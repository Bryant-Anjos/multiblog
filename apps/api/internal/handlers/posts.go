package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type PostHandler struct {
	repo *repositories.PostRepository
}

func NewPostHandler(repo *repositories.PostRepository) *PostHandler {
	return &PostHandler{repo: repo}
}

func (h *PostHandler) Create(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	var req models.CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Title == "" || req.Slug == "" {
		writeBadRequest(w, "title and slug are required")
		return
	}

	post, err := h.repo.Create(siteID, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, post)
}

func (h *PostHandler) List(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	posts, err := h.repo.ListPublished(siteID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, posts)
}

func (h *PostHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	posts, err := h.repo.List(siteID, nil)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, posts)
}

func (h *PostHandler) Get(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["postId"]

	var post *models.Post
	var err error

	post, err = h.repo.GetByID(siteID, id)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if post == nil {
		post, err = h.repo.GetBySlug(siteID, id)
		if err != nil {
			writeInternalError(w, err)
			return
		}
	}
	if post == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, post)
}

func (h *PostHandler) Update(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["postId"]
	var req models.UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	post, err := h.repo.Update(siteID, id, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if post == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, post)
}

func (h *PostHandler) Delete(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["postId"]
	err := h.repo.Delete(siteID, id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
