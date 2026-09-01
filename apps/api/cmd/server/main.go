package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/config"
	"github.com/multiblog/api/internal/database"
	"github.com/multiblog/api/internal/handlers"
	"github.com/multiblog/api/internal/middleware"
	"github.com/multiblog/api/internal/repositories"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := database.Migrate(db, "./migrations"); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	siteRepo := repositories.NewSiteRepository(db)
	postRepo := repositories.NewPostRepository(db)
	pageRepo := repositories.NewPageRepository(db)
	storyRepo := repositories.NewStoryRepository(db)
	navRepo := repositories.NewNavigationRepository(db)
	adminRepo := repositories.NewAdminRepository(db)

	if err := adminRepo.EnsureAdmin(cfg.AdminPassword); err != nil {
		log.Fatalf("failed to ensure admin user: %v", err)
	}

	auth := middleware.NewAuthMiddleware(cfg.JWTSecret)

	siteHandler := handlers.NewSiteHandler(siteRepo)
	postHandler := handlers.NewPostHandler(postRepo)
	pageHandler := handlers.NewPageHandler(pageRepo)
	storyHandler := handlers.NewStoryHandler(storyRepo)
	navHandler := handlers.NewNavigationHandler(navRepo)
	authHandler := handlers.NewAuthHandler(adminRepo, auth)
	publicHandler := handlers.NewPublicHandler(siteRepo, postRepo, pageRepo, storyRepo, navRepo)

	router := mux.NewRouter()

	cors := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", cfg.CORSOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods(http.MethodGet)

	router.HandleFunc("/auth/login", authHandler.Login).Methods(http.MethodPost)

	admin := router.PathPrefix("/api/admin").Subrouter()
	admin.Use(auth.Authenticate)

	admin.HandleFunc("/sites", siteHandler.List).Methods(http.MethodGet)
	admin.HandleFunc("/sites", siteHandler.Create).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{id}", siteHandler.Get).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{id}", siteHandler.Update).Methods(http.MethodPut)
	admin.HandleFunc("/sites/{id}", siteHandler.Delete).Methods(http.MethodDelete)
	admin.HandleFunc("/sites/{id}/domains", siteHandler.GetDomains).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{id}/domains", siteHandler.AddDomain).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{id}/domains/{domainId}", siteHandler.DeleteDomain).Methods(http.MethodDelete)
	admin.HandleFunc("/sites/{id}/domains/{domainId}", siteHandler.SetPrimaryDomain).Methods(http.MethodPut)

	admin.HandleFunc("/sites/{siteId}/posts", postHandler.ListAll).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/posts", postHandler.Create).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{siteId}/posts/{postId}", postHandler.Get).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/posts/{postId}", postHandler.Update).Methods(http.MethodPut)
	admin.HandleFunc("/sites/{siteId}/posts/{postId}", postHandler.Delete).Methods(http.MethodDelete)

	admin.HandleFunc("/sites/{siteId}/pages", pageHandler.ListAll).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/pages", pageHandler.Create).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{siteId}/pages/{pageId}", pageHandler.Get).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/pages/{pageId}", pageHandler.Update).Methods(http.MethodPut)
	admin.HandleFunc("/sites/{siteId}/pages/{pageId}", pageHandler.Delete).Methods(http.MethodDelete)

	admin.HandleFunc("/sites/{siteId}/stories", storyHandler.List).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/stories", storyHandler.Create).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}", storyHandler.Get).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}", storyHandler.Update).Methods(http.MethodPut)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}", storyHandler.Delete).Methods(http.MethodDelete)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}/groups", storyHandler.CreateGroup).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}/chapters", storyHandler.CreateChapter).Methods(http.MethodPost)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}/chapters/reorder", storyHandler.ReorderChapters).Methods(http.MethodPut)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}/chapters/{chapterId}", storyHandler.GetChapter).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}/chapters/{chapterId}", storyHandler.UpdateChapter).Methods(http.MethodPut)
	admin.HandleFunc("/sites/{siteId}/stories/{storyId}/chapters/{chapterId}", storyHandler.DeleteChapter).Methods(http.MethodDelete)

	admin.HandleFunc("/sites/{siteId}/navigation", navHandler.ListAll).Methods(http.MethodGet)
	admin.HandleFunc("/sites/{siteId}/navigation", navHandler.Create).Methods(http.MethodPost)
	admin.HandleFunc("/navigation/{id}", navHandler.Update).Methods(http.MethodPut)
	admin.HandleFunc("/navigation/{id}", navHandler.Delete).Methods(http.MethodDelete)

	public := router.PathPrefix("/api/public").Subrouter()
	public.Use(publicHandler.ResolveSite)

	public.HandleFunc("/site", publicHandler.GetSiteWithNav).Methods(http.MethodGet)
	public.HandleFunc("/posts", publicHandler.ListPosts).Methods(http.MethodGet)
	public.HandleFunc("/posts/{slug}", publicHandler.GetPost).Methods(http.MethodGet)
	public.HandleFunc("/pages", publicHandler.ListPages).Methods(http.MethodGet)
	public.HandleFunc("/pages/{slug}", publicHandler.GetPage).Methods(http.MethodGet)
	public.HandleFunc("/stories", publicHandler.ListStories).Methods(http.MethodGet)
	public.HandleFunc("/stories/{slug}", publicHandler.GetStory).Methods(http.MethodGet)
	public.HandleFunc("/stories/{storySlug}/chapters/{chapterId}", publicHandler.GetChapter).Methods(http.MethodGet)

	addr := ":" + cfg.Port
	log.Printf("API server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, cors(router)))
}
