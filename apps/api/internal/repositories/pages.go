package repositories

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/multiblog/api/internal/models"
)

type PageRepository struct {
	db *sql.DB
}

func NewPageRepository(db *sql.DB) *PageRepository {
	return &PageRepository{db: db}
}

func (r *PageRepository) Create(siteID string, req *models.CreatePageRequest) (*models.Page, error) {
	page := &models.Page{
		ID:      uuid.New().String(),
		SiteID:  siteID,
		Title:   req.Title,
		Slug:    req.Slug,
		Content: req.Content,
		Status:  req.Status,
	}

	if page.Status == "" {
		page.Status = models.PostStatusDraft
	}

	query := `
		INSERT INTO pages (id, site_id, title, slug, content, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, page.ID, page.SiteID, page.Title, page.Slug,
		page.Content, page.Status).
		Scan(&page.CreatedAt, &page.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create page: %w", err)
	}

	return page, nil
}

func (r *PageRepository) GetByID(siteID, id string) (*models.Page, error) {
	page := &models.Page{}
	query := `
		SELECT id, site_id, title, slug, content, status, created_at, updated_at
		FROM pages
		WHERE id = $1 AND site_id = $2
	`

	err := r.db.QueryRow(query, id, siteID).Scan(
		&page.ID, &page.SiteID, &page.Title, &page.Slug, &page.Content,
		&page.Status, &page.CreatedAt, &page.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get page: %w", err)
	}

	return page, nil
}

func (r *PageRepository) GetBySlug(siteID, slug string) (*models.Page, error) {
	page := &models.Page{}
	query := `
		SELECT id, site_id, title, slug, content, status, created_at, updated_at
		FROM pages
		WHERE slug = $1 AND site_id = $2
	`

	err := r.db.QueryRow(query, slug, siteID).Scan(
		&page.ID, &page.SiteID, &page.Title, &page.Slug, &page.Content,
		&page.Status, &page.CreatedAt, &page.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get page: %w", err)
	}

	return page, nil
}

func (r *PageRepository) List(siteID string) ([]*models.Page, error) {
	query := `
		SELECT id, site_id, title, slug, content, status, created_at, updated_at
		FROM pages
		WHERE site_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, siteID)
	if err != nil {
		return nil, fmt.Errorf("failed to list pages: %w", err)
	}
	defer rows.Close()

	var pages []*models.Page
	for rows.Next() {
		page := &models.Page{}
		err := rows.Scan(
			&page.ID, &page.SiteID, &page.Title, &page.Slug, &page.Content,
			&page.Status, &page.CreatedAt, &page.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan page: %w", err)
		}
		pages = append(pages, page)
	}

	if pages == nil {
		pages = []*models.Page{}
	}

	return pages, nil
}

func (r *PageRepository) ListPublished(siteID string) ([]*models.Page, error) {
	query := `
		SELECT id, site_id, title, slug, content, status, created_at, updated_at
		FROM pages
		WHERE site_id = $1 AND status = $2
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, siteID, models.PostStatusPublished)
	if err != nil {
		return nil, fmt.Errorf("failed to list published pages: %w", err)
	}
	defer rows.Close()

	var pages []*models.Page
	for rows.Next() {
		page := &models.Page{}
		err := rows.Scan(
			&page.ID, &page.SiteID, &page.Title, &page.Slug, &page.Content,
			&page.Status, &page.CreatedAt, &page.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan page: %w", err)
		}
		pages = append(pages, page)
	}

	if pages == nil {
		pages = []*models.Page{}
	}

	return pages, nil
}

func (r *PageRepository) Update(siteID, id string, req *models.CreatePageRequest) (*models.Page, error) {
	page := &models.Page{}
	query := `
		UPDATE pages
		SET title = $3, slug = $4, content = $5, status = $6, updated_at = NOW()
		WHERE id = $1 AND site_id = $2
		RETURNING id, site_id, title, slug, content, status, created_at, updated_at
	`

	err := r.db.QueryRow(query, id, siteID, req.Title, req.Slug, req.Content, req.Status).
		Scan(&page.ID, &page.SiteID, &page.Title, &page.Slug, &page.Content,
			&page.Status, &page.CreatedAt, &page.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update page: %w", err)
	}

	return page, nil
}

func (r *PageRepository) Delete(siteID, id string) error {
	query := `DELETE FROM pages WHERE id = $1 AND site_id = $2`
	_, err := r.db.Exec(query, id, siteID)
	if err != nil {
		return fmt.Errorf("failed to delete page: %w", err)
	}
	return nil
}
