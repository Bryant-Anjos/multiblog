package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/multiblog/api/internal/middleware"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type AuthHandler struct {
	adminRepo *repositories.AdminRepository
	auth      *middleware.AuthMiddleware
}

func NewAuthHandler(adminRepo *repositories.AdminRepository, auth *middleware.AuthMiddleware) *AuthHandler {
	return &AuthHandler{adminRepo: adminRepo, auth: auth}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Password == "" {
		writeBadRequest(w, "password is required")
		return
	}

	valid, err := h.adminRepo.VerifyPassword(req.Password)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	if !valid {
		writeError(w, http.StatusUnauthorized, "invalid password")
		return
	}

	token, err := h.auth.GenerateToken()
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, models.LoginResponse{Token: token})
}
