package handlers

import (
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type PublicHandler struct {
	siteRepo  *repositories.SiteRepository
	postRepo  *repositories.PostRepository
	pageRepo  *repositories.PageRepository
	storyRepo *repositories.StoryRepository
	navRepo   *repositories.NavigationRepository
}

func NewPublicHandler(
	siteRepo *repositories.SiteRepository,
	postRepo *repositories.PostRepository,
	pageRepo *repositories.PageRepository,
	storyRepo *repositories.StoryRepository,
	navRepo *repositories.NavigationRepository,
) *PublicHandler {
	return &PublicHandler{
		siteRepo:  siteRepo,
		postRepo:  postRepo,
		pageRepo:  pageRepo,
		storyRepo: storyRepo,
		navRepo:   navRepo,
	}
}

type publicContext struct {
	site *models.Site
}

func (h *PublicHandler) ResolveSite(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hostname := r.Header.Get("X-Site-Host")
		if hostname == "" {
			hostname = r.Host
		}
		hostname = strings.Split(hostname, ":")[0]

		site, err := h.siteRepo.GetByHostname(hostname)
		if err != nil {
			writeInternalError(w, err)
			return
		}
		if site == nil {
			writeError(w, http.StatusNotFound, "no site configured for this hostname")
			return
		}

		ctx := &publicContext{site: site}
		next.ServeHTTP(w, r.WithContext(contextWithSite(r.Context(), ctx)))
	})
}

func (h *PublicHandler) GetSite(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	writeJSON(w, http.StatusOK, ctx.site)
}

func (h *PublicHandler) GetSiteWithNav(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	nav, err := h.navRepo.List(ctx.site.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"site":       ctx.site,
		"navigation": nav,
	})
}

func (h *PublicHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	posts, err := h.postRepo.ListPublished(ctx.site.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, posts)
}

func (h *PublicHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	slug := mux.Vars(r)["slug"]

	post, err := h.postRepo.GetBySlug(ctx.site.ID, slug)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if post == nil || post.Status != models.PostStatusPublished {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, post)
}

func (h *PublicHandler) ListPages(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	pages, err := h.pageRepo.ListPublished(ctx.site.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, pages)
}

func (h *PublicHandler) GetPage(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	slug := mux.Vars(r)["slug"]

	page, err := h.pageRepo.GetBySlug(ctx.site.ID, slug)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if page == nil || page.Status != models.PostStatusPublished {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, page)
}

func (h *PublicHandler) ListStories(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	stories, err := h.storyRepo.ListWithSpinoffs(ctx.site.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, stories)
}

func (h *PublicHandler) GetStory(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	slug := mux.Vars(r)["slug"]

	story, err := h.storyRepo.GetBySlug(ctx.site.ID, slug)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	groups, err := h.storyRepo.GetGroups(story.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	chapters, err := h.storyRepo.GetChapters(story.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"story":    story,
		"groups":   groups,
		"chapters": chapters,
	})
}

func (h *PublicHandler) GetChapter(w http.ResponseWriter, r *http.Request) {
	ctx := siteFromContext(r.Context())
	storySlug := mux.Vars(r)["storySlug"]
	chapterID := mux.Vars(r)["chapterId"]

	story, err := h.storyRepo.GetBySlug(ctx.site.ID, storySlug)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	chapter, err := h.storyRepo.GetChapterBySlug(story.ID, chapterID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if chapter == nil {
		chapter, err = h.storyRepo.GetChapter(story.ID, chapterID)
		if err != nil {
			writeInternalError(w, err)
			return
		}
	}
	if chapter == nil || chapter.Status != models.PostStatusPublished {
		writeNotFound(w)
		return
	}

	chapters, _ := h.storyRepo.GetChapters(story.ID)

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"story":    story,
		"chapter":  chapter,
		"chapters": chapters,
	})
}
