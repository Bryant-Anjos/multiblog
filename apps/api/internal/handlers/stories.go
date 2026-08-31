package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

type StoryHandler struct {
	repo *repositories.StoryRepository
}

func NewStoryHandler(repo *repositories.StoryRepository) *StoryHandler {
	return &StoryHandler{repo: repo}
}

func (h *StoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	var req models.CreateStoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Title == "" || req.Slug == "" {
		writeBadRequest(w, "title and slug are required")
		return
	}

	story, err := h.repo.Create(siteID, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, story)
}

func (h *StoryHandler) List(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	stories, err := h.repo.ListWithSpinoffs(siteID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, stories)
}

func (h *StoryHandler) Get(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["storyId"]

	var story *models.Story
	var err error

	story, err = h.repo.GetByID(siteID, id)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		story, err = h.repo.GetBySlug(siteID, id)
		if err != nil {
			writeInternalError(w, err)
			return
		}
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	groups, err := h.repo.GetGroups(story.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	chapters, err := h.repo.GetChapters(story.ID)
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

func (h *StoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["storyId"]
	var req models.CreateStoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	story, err := h.repo.Update(siteID, id, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, story)
}

func (h *StoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	id := mux.Vars(r)["storyId"]
	err := h.repo.Delete(siteID, id)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *StoryHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	storyID := mux.Vars(r)["storyId"]

	story, err := h.repo.GetByID(siteID, storyID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	var req struct {
		Title string `json:"title"`
		Slug  string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Title == "" || req.Slug == "" {
		writeBadRequest(w, "title and slug are required")
		return
	}

	groups, err := h.repo.GetGroups(storyID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	group, err := h.repo.CreateGroup(storyID, req.Title, req.Slug, len(groups)+1)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, group)
}

func (h *StoryHandler) CreateChapter(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	storyID := mux.Vars(r)["storyId"]

	story, err := h.repo.GetByID(siteID, storyID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	var req models.CreateChapterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	if req.Title == "" || req.Slug == "" {
		writeBadRequest(w, "title and slug are required")
		return
	}

	chapter, err := h.repo.CreateChapter(storyID, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, chapter)
}

func (h *StoryHandler) GetChapter(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	storyID := mux.Vars(r)["storyId"]
	chapterID := mux.Vars(r)["chapterId"]

	story, err := h.repo.GetByID(siteID, storyID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	chapter, err := h.repo.GetChapter(storyID, chapterID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if chapter == nil {
		chapter, err = h.repo.GetChapterBySlug(storyID, chapterID)
		if err != nil {
			writeInternalError(w, err)
			return
		}
	}
	if chapter == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, chapter)
}

func (h *StoryHandler) UpdateChapter(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	storyID := mux.Vars(r)["storyId"]
	chapterID := mux.Vars(r)["chapterId"]

	story, err := h.repo.GetByID(siteID, storyID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	var req models.CreateChapterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeBadRequest(w, "invalid request body")
		return
	}

	chapter, err := h.repo.UpdateChapter(storyID, chapterID, &req)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if chapter == nil {
		writeNotFound(w)
		return
	}

	writeJSON(w, http.StatusOK, chapter)
}

func (h *StoryHandler) DeleteChapter(w http.ResponseWriter, r *http.Request) {
	siteID := mux.Vars(r)["siteId"]
	storyID := mux.Vars(r)["storyId"]
	chapterID := mux.Vars(r)["chapterId"]

	story, err := h.repo.GetByID(siteID, storyID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if story == nil {
		writeNotFound(w)
		return
	}

	err = h.repo.DeleteChapter(storyID, chapterID)
	if err != nil {
		writeInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
