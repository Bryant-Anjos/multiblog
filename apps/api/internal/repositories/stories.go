package repositories

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/multiblog/api/internal/models"
)

type StoryRepository struct {
	db *sql.DB
}

func NewStoryRepository(db *sql.DB) *StoryRepository {
	return &StoryRepository{db: db}
}

func (r *StoryRepository) Create(siteID string, req *models.CreateStoryRequest) (*models.Story, error) {
	story := &models.Story{
		ID:          uuid.New().String(),
		SiteID:      siteID,
		Title:       req.Title,
		Slug:        req.Slug,
		Description: req.Description,
	}

	query := `
		INSERT INTO stories (id, site_id, title, slug, description, parent_story_id, relationship_type)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, story.ID, story.SiteID, story.Title, story.Slug,
		story.Description, story.ParentStoryID, story.RelationshipType).
		Scan(&story.CreatedAt, &story.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create story: %w", err)
	}

	return story, nil
}

func (r *StoryRepository) GetByID(siteID, id string) (*models.Story, error) {
	story := &models.Story{}
	query := `
		SELECT id, site_id, title, slug, description, parent_story_id, relationship_type, created_at, updated_at
		FROM stories
		WHERE id = $1 AND site_id = $2
	`

	err := r.db.QueryRow(query, id, siteID).Scan(
		&story.ID, &story.SiteID, &story.Title, &story.Slug, &story.Description,
		&story.ParentStoryID, &story.RelationshipType, &story.CreatedAt, &story.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get story: %w", err)
	}

	return story, nil
}

func (r *StoryRepository) GetBySlug(siteID, slug string) (*models.Story, error) {
	story := &models.Story{}
	query := `
		SELECT id, site_id, title, slug, description, parent_story_id, relationship_type, created_at, updated_at
		FROM stories
		WHERE slug = $1 AND site_id = $2
	`

	err := r.db.QueryRow(query, slug, siteID).Scan(
		&story.ID, &story.SiteID, &story.Title, &story.Slug, &story.Description,
		&story.ParentStoryID, &story.RelationshipType, &story.CreatedAt, &story.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get story: %w", err)
	}

	return story, nil
}

func (r *StoryRepository) List(siteID string) ([]*models.Story, error) {
	query := `
		SELECT id, site_id, title, slug, description, parent_story_id, relationship_type, created_at, updated_at
		FROM stories
		WHERE site_id = $1 AND parent_story_id IS NULL
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, siteID)
	if err != nil {
		return nil, fmt.Errorf("failed to list stories: %w", err)
	}
	defer rows.Close()

	var stories []*models.Story
	for rows.Next() {
		story := &models.Story{}
		err := rows.Scan(
			&story.ID, &story.SiteID, &story.Title, &story.Slug, &story.Description,
			&story.ParentStoryID, &story.RelationshipType, &story.CreatedAt, &story.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan story: %w", err)
		}
		stories = append(stories, story)
	}

	if stories == nil {
		stories = []*models.Story{}
	}

	return stories, nil
}

func (r *StoryRepository) ListWithSpinoffs(siteID string) ([]*models.Story, error) {
	query := `
		SELECT id, site_id, title, slug, description, parent_story_id, relationship_type, created_at, updated_at
		FROM stories
		WHERE site_id = $1
		ORDER BY parent_story_id NULLS FIRST, created_at ASC
	`

	rows, err := r.db.Query(query, siteID)
	if err != nil {
		return nil, fmt.Errorf("failed to list stories: %w", err)
	}
	defer rows.Close()

	var stories []*models.Story
	for rows.Next() {
		story := &models.Story{}
		err := rows.Scan(
			&story.ID, &story.SiteID, &story.Title, &story.Slug, &story.Description,
			&story.ParentStoryID, &story.RelationshipType, &story.CreatedAt, &story.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan story: %w", err)
		}
		stories = append(stories, story)
	}

	if stories == nil {
		stories = []*models.Story{}
	}

	return stories, nil
}

func (r *StoryRepository) Update(siteID, id string, req *models.CreateStoryRequest) (*models.Story, error) {
	story := &models.Story{}
	query := `
		UPDATE stories
		SET title = $3, slug = $4, description = $5, updated_at = NOW()
		WHERE id = $1 AND site_id = $2
		RETURNING id, site_id, title, slug, description, parent_story_id, relationship_type, created_at, updated_at
	`

	err := r.db.QueryRow(query, id, siteID, req.Title, req.Slug, req.Description).
		Scan(&story.ID, &story.SiteID, &story.Title, &story.Slug, &story.Description,
			&story.ParentStoryID, &story.RelationshipType, &story.CreatedAt, &story.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update story: %w", err)
	}

	return story, nil
}

func (r *StoryRepository) Delete(siteID, id string) error {
	query := `DELETE FROM stories WHERE id = $1 AND site_id = $2`
	_, err := r.db.Exec(query, id, siteID)
	if err != nil {
		return fmt.Errorf("failed to delete story: %w", err)
	}
	return nil
}

func (r *StoryRepository) CreateGroup(storyID string, title, slug string, position int) (*models.StoryGroup, error) {
	group := &models.StoryGroup{
		ID:       uuid.New().String(),
		StoryID:  storyID,
		Title:    title,
		Slug:     slug,
		Position: position,
	}

	query := `
		INSERT INTO story_groups (id, story_id, title, slug, position)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, group.ID, group.StoryID, group.Title, group.Slug, group.Position).
		Scan(&group.CreatedAt, &group.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create story group: %w", err)
	}

	return group, nil
}

func (r *StoryRepository) GetGroups(storyID string) ([]*models.StoryGroup, error) {
	query := `
		SELECT id, story_id, title, slug, position, created_at, updated_at
		FROM story_groups
		WHERE story_id = $1
		ORDER BY position ASC
	`

	rows, err := r.db.Query(query, storyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get story groups: %w", err)
	}
	defer rows.Close()

	var groups []*models.StoryGroup
	for rows.Next() {
		group := &models.StoryGroup{}
		err := rows.Scan(&group.ID, &group.StoryID, &group.Title, &group.Slug,
			&group.Position, &group.CreatedAt, &group.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan story group: %w", err)
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (r *StoryRepository) CreateChapter(storyID string, req *models.CreateChapterRequest) (*models.Chapter, error) {
	chapter := &models.Chapter{
		ID:      uuid.New().String(),
		StoryID: storyID,
		GroupID: req.GroupID,
		Title:   req.Title,
		Slug:    req.Slug,
		Content: req.Content,
		Status:  req.Status,
	}

	if chapter.Status == "" {
		chapter.Status = models.PostStatusDraft
	}

	var maxPosition int
	posQuery := `SELECT COALESCE(MAX(position), 0) FROM chapters WHERE story_id = $1 AND ($2::text IS NULL AND group_id IS NULL OR group_id = $2::uuid)`
	_ = r.db.QueryRow(posQuery, storyID, req.GroupID).Scan(&maxPosition)
	chapter.Position = maxPosition + 1

	query := `
		INSERT INTO chapters (id, story_id, group_id, title, slug, content, position, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, chapter.ID, chapter.StoryID, chapter.GroupID, chapter.Title,
		chapter.Slug, chapter.Content, chapter.Position, chapter.Status).
		Scan(&chapter.CreatedAt, &chapter.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create chapter: %w", err)
	}

	return chapter, nil
}

func (r *StoryRepository) GetChapter(storyID, chapterID string) (*models.Chapter, error) {
	if _, err := uuid.Parse(chapterID); err != nil {
		return nil, nil
	}

	chapter := &models.Chapter{}
	query := `
		SELECT id, story_id, group_id, title, slug, content, position, status, published_at, created_at, updated_at
		FROM chapters
		WHERE id = $1 AND story_id = $2
	`

	err := r.db.QueryRow(query, chapterID, storyID).Scan(
		&chapter.ID, &chapter.StoryID, &chapter.GroupID, &chapter.Title, &chapter.Slug,
		&chapter.Content, &chapter.Position, &chapter.Status, &chapter.PublishedAt,
		&chapter.CreatedAt, &chapter.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get chapter: %w", err)
	}

	return chapter, nil
}

func (r *StoryRepository) GetChapterBySlug(storyID, slug string) (*models.Chapter, error) {
	chapter := &models.Chapter{}
	query := `
		SELECT id, story_id, group_id, title, slug, content, position, status, published_at, created_at, updated_at
		FROM chapters
		WHERE slug = $1 AND story_id = $2
	`

	err := r.db.QueryRow(query, slug, storyID).Scan(
		&chapter.ID, &chapter.StoryID, &chapter.GroupID, &chapter.Title, &chapter.Slug,
		&chapter.Content, &chapter.Position, &chapter.Status, &chapter.PublishedAt,
		&chapter.CreatedAt, &chapter.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get chapter: %w", err)
	}

	return chapter, nil
}

func (r *StoryRepository) GetChapters(storyID string) ([]*models.Chapter, error) {
	query := `
		SELECT id, story_id, group_id, title, slug, content, position, status, published_at, created_at, updated_at
		FROM chapters
		WHERE story_id = $1
		ORDER BY position ASC
	`

	rows, err := r.db.Query(query, storyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get chapters: %w", err)
	}
	defer rows.Close()

	var chapters []*models.Chapter
	for rows.Next() {
		chapter := &models.Chapter{}
		err := rows.Scan(
			&chapter.ID, &chapter.StoryID, &chapter.GroupID, &chapter.Title, &chapter.Slug,
			&chapter.Content, &chapter.Position, &chapter.Status, &chapter.PublishedAt,
			&chapter.CreatedAt, &chapter.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chapter: %w", err)
		}
		chapters = append(chapters, chapter)
	}

	return chapters, nil
}

func (r *StoryRepository) GetChaptersByGroup(storyID, groupID string) ([]*models.Chapter, error) {
	query := `
		SELECT id, story_id, group_id, title, slug, content, position, status, published_at, created_at, updated_at
		FROM chapters
		WHERE story_id = $1 AND group_id = $2
		ORDER BY position ASC
	`

	rows, err := r.db.Query(query, storyID, groupID)
	if err != nil {
		return nil, fmt.Errorf("failed to get chapters by group: %w", err)
	}
	defer rows.Close()

	var chapters []*models.Chapter
	for rows.Next() {
		chapter := &models.Chapter{}
		err := rows.Scan(
			&chapter.ID, &chapter.StoryID, &chapter.GroupID, &chapter.Title, &chapter.Slug,
			&chapter.Content, &chapter.Position, &chapter.Status, &chapter.PublishedAt,
			&chapter.CreatedAt, &chapter.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chapter: %w", err)
		}
		chapters = append(chapters, chapter)
	}

	return chapters, nil
}

func (r *StoryRepository) UpdateChapter(storyID, chapterID string, req *models.CreateChapterRequest) (*models.Chapter, error) {
	chapter := &models.Chapter{}
	query := `
		UPDATE chapters
		SET title = $3, slug = $4, content = $5, group_id = $6, status = $7, updated_at = NOW()
		WHERE id = $1 AND story_id = $2
		RETURNING id, story_id, group_id, title, slug, content, position, status, published_at, created_at, updated_at
	`

	err := r.db.QueryRow(query, chapterID, storyID, req.Title, req.Slug, req.Content,
		req.GroupID, req.Status).
		Scan(&chapter.ID, &chapter.StoryID, &chapter.GroupID, &chapter.Title, &chapter.Slug,
			&chapter.Content, &chapter.Position, &chapter.Status, &chapter.PublishedAt,
			&chapter.CreatedAt, &chapter.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update chapter: %w", err)
	}

	return chapter, nil
}

func (r *StoryRepository) DeleteChapter(storyID, chapterID string) error {
	query := `DELETE FROM chapters WHERE id = $1 AND story_id = $2`
	_, err := r.db.Exec(query, chapterID, storyID)
	if err != nil {
		return fmt.Errorf("failed to delete chapter: %w", err)
	}
	return nil
}
