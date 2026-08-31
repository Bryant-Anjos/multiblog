package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type PageHandler struct {
	repo *repositories.PageRepository
}

func NewPageHandler(repo *repositories.PageRepository) *PageHandler {
	return &PageHandler{repo: repo}
}

func (h *PageHandler) Create(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	var req models.CreatePageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Title == "" || req.Slug == "" {
		writeBadRequest(w, "title and slug are required")
		return
	}

	page, err := h.repo.Create(siteID, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, page)
}

func (h *PageHandler) List(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	pages, err := h.repo.ListPublished(siteID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, pages)
}

func (h *PageHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	pages, err := h.repo.List(siteID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, pages)
}

func (h *PageHandler) Get(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["pageId"]

	var page *models.Page
	var err error

	page, err = h.repo.GetByID(siteID, id)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if page == nil {
		page, err = h.repo.GetBySlug(siteID, id)
		if err != nil {
			writeInternalError(w, err)
			return
		}
	}
	if page == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, page)
}

func (h *PageHandler) Update(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["pageId"]
	var req models.CreatePageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	page, err := h.repo.Update(siteID, id, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if page == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, page)
}

func (h *PageHandler) Delete(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["pageId"]
	err := h.repo.Delete(siteID, id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
