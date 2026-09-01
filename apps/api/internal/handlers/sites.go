package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type SiteHandler struct {
	repo *repositories.SiteRepository
}

func NewSiteHandler(repo *repositories.SiteRepository) *SiteHandler {
	return &SiteHandler{repo: repo}
}

func (h *SiteHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateSiteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Name == "" || req.Slug == "" {
		writeBadRequest(w, "name and slug are required")
		return
	}

	site, err := h.repo.Create(&req)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, site)
}

func (h *SiteHandler) List(w http.ResponseWriter, r *http.Request) {
	sites, err := h.repo.List()
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, sites)
}

func (h *SiteHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	site, err := h.repo.GetByID(id)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if site == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, site)
}

func (h *SiteHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req models.UpdateSiteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	site, err := h.repo.Update(id, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if site == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, site)
}

func (h *SiteHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	err := h.repo.Delete(id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *SiteHandler) GetDomains(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	domains, err := h.repo.GetDomains(id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, domains)
}

func (h *SiteHandler) AddDomain(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req struct {
		Hostname string `json:"hostname"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Hostname == "" {
		writeBadRequest(w, "hostname is required")
		return
	}

	domain, err := h.repo.AddDomain(id, req.Hostname, false)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, domain)
}

func (h *SiteHandler) DeleteDomain(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	err := h.repo.DeleteDomain(id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *SiteHandler) SetPrimaryDomain(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	siteID := vars["id"]
	domainID := vars["domainId"]

	err := h.repo.SetPrimaryDomain(siteID, domainID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
