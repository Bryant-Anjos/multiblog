package repositories

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/multiblog/api/internal/models"
)

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) Create(siteID string, req *models.CreatePostRequest) (*models.Post, error) {
	post := &models.Post{
		ID:      uuid.New().String(),
		SiteID:  siteID,
		Title:   req.Title,
		Slug:    req.Slug,
		Content: req.Content,
		Excerpt: req.Excerpt,
		Status:  req.Status,
	}

	if post.Status == "" {
		post.Status = models.PostStatusDraft
	}

	query := `
		INSERT INTO posts (id, site_id, title, slug, content, excerpt, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, post.ID, post.SiteID, post.Title, post.Slug,
		post.Content, post.Excerpt, post.Status).
		Scan(&post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create post: %w", err)
	}

	return post, nil
}

func (r *PostRepository) GetByID(siteID, id string) (*models.Post, error) {
	post := &models.Post{}
	query := `
		SELECT id, site_id, title, slug, content, excerpt, status, published_at, created_at, updated_at
		FROM posts
		WHERE id = $1 AND site_id = $2
	`

	err := r.db.QueryRow(query, id, siteID).Scan(
		&post.ID, &post.SiteID, &post.Title, &post.Slug, &post.Content,
		&post.Excerpt, &post.Status, &post.PublishedAt, &post.CreatedAt, &post.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}

	return post, nil
}

func (r *PostRepository) GetBySlug(siteID, slug string) (*models.Post, error) {
	post := &models.Post{}
	query := `
		SELECT id, site_id, title, slug, content, excerpt, status, published_at, created_at, updated_at
		FROM posts
		WHERE slug = $1 AND site_id = $2
	`

	err := r.db.QueryRow(query, slug, siteID).Scan(
		&post.ID, &post.SiteID, &post.Title, &post.Slug, &post.Content,
		&post.Excerpt, &post.Status, &post.PublishedAt, &post.CreatedAt, &post.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}

	return post, nil
}

func (r *PostRepository) List(siteID string, status *models.PostStatus) ([]*models.Post, error) {
	query := `
		SELECT id, site_id, title, slug, content, excerpt, status, published_at, created_at, updated_at
		FROM posts
		WHERE site_id = $1
	`

	args := []interface{}{siteID}

	if status != nil {
		query += ` AND status = $2`
		args = append(args, *status)
	}

	query += ` ORDER BY created_at DESC`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list posts: %w", err)
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		post := &models.Post{}
		err := rows.Scan(
			&post.ID, &post.SiteID, &post.Title, &post.Slug, &post.Content,
			&post.Excerpt, &post.Status, &post.PublishedAt, &post.CreatedAt, &post.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}
		posts = append(posts, post)
	}

	if posts == nil {
		posts = []*models.Post{}
	}

	return posts, nil
}

func (r *PostRepository) ListPublished(siteID string) ([]*models.Post, error) {
	published := models.PostStatusPublished
	return r.List(siteID, &published)
}

func (r *PostRepository) Update(siteID, id string, req *models.UpdatePostRequest) (*models.Post, error) {
	post, err := r.GetByID(siteID, id)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, nil
	}

	if req.Title != nil {
		post.Title = *req.Title
	}
	if req.Content != nil {
		post.Content = *req.Content
	}
	if req.Excerpt != nil {
		post.Excerpt = *req.Excerpt
	}
	if req.Status != nil {
		post.Status = *req.Status
		if *req.Status == models.PostStatusPublished && post.PublishedAt == nil {
			query := `UPDATE posts SET status = $3, published_at = NOW() WHERE id = $1 AND site_id = $2 RETURNING published_at, updated_at`
			err = r.db.QueryRow(query, id, siteID, post.Status).Scan(&post.PublishedAt, &post.UpdatedAt)
		} else {
			query := `UPDATE posts SET status = $3 WHERE id = $1 AND site_id = $2 RETURNING published_at, updated_at`
			err = r.db.QueryRow(query, id, siteID, post.Status).Scan(&post.PublishedAt, &post.UpdatedAt)
		}
	} else {
		query := `UPDATE posts SET title = $3, content = $4, excerpt = $5 WHERE id = $1 AND site_id = $2 RETURNING updated_at`
		err = r.db.QueryRow(query, id, siteID, post.Title, post.Content, post.Excerpt).Scan(&post.UpdatedAt)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to update post: %w", err)
	}

	return post, nil
}

func (r *PostRepository) Delete(siteID, id string) error {
	query := `DELETE FROM posts WHERE id = $1 AND site_id = $2`
	_, err := r.db.Exec(query, id, siteID)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}
	return nil
}
