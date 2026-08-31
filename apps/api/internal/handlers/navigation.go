package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type NavigationHandler struct {
	repo *repositories.NavigationRepository
}

func NewNavigationHandler(repo *repositories.NavigationRepository) *NavigationHandler {
	return &NavigationHandler{repo: repo}
}

func (h *NavigationHandler) List(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	items, err := h.repo.List(siteID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, items)
}

func (h *NavigationHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	items, err := h.repo.ListAll(siteID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, items)
}

func (h *NavigationHandler) Create(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	var req struct {
		Label       string `json:"label"`
		Type        string `json:"type"`
		Destination string `json:"destination"`
		Position    int    `json:"position"`
		IsVisible   bool   `json:"is_visible"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Label == "" || req.Type == "" {
		writeBadRequest(w, "label and type are required")
		return
	}

	navItem := &models.NavigationItem{
		Label:       req.Label,
		Type:        req.Type,
		Destination: req.Destination,
		Position:    req.Position,
		IsVisible:   req.IsVisible,
	}

	created, err := h.repo.Create(siteID, navItem)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, created)
}

func (h *NavigationHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req struct {
		Label       string `json:"label"`
		Type        string `json:"type"`
		Destination string `json:"destination"`
		Position    int    `json:"position"`
		IsVisible   bool   `json:"is_visible"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	item := &models.NavigationItem{
		Label:       req.Label,
		Type:        req.Type,
		Destination: req.Destination,
		Position:    req.Position,
		IsVisible:   req.IsVisible,
	}

	err := h.repo.Update(id, item)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *NavigationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	err := h.repo.Delete(id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
