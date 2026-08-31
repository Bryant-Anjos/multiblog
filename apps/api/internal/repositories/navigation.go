package repositories

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/multiblog/api/internal/models"
)

type NavigationRepository struct {
	db *sql.DB
}

func NewNavigationRepository(db *sql.DB) *NavigationRepository {
	return &NavigationRepository{db: db}
}

func (r *NavigationRepository) Create(siteID string, item *models.NavigationItem) (*models.NavigationItem, error) {
	item.ID = uuid.New().String()
	item.SiteID = siteID

	query := `
		INSERT INTO navigation_items (id, site_id, label, type, destination, position, is_visible)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at
	`

	err := r.db.QueryRow(query, item.ID, item.SiteID, item.Label, item.Type,
		item.Destination, item.Position, item.IsVisible).
		Scan(&item.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create navigation item: %w", err)
	}

	return item, nil
}

func (r *NavigationRepository) List(siteID string) ([]*models.NavigationItem, error) {
	query := `
		SELECT id, site_id, label, type, destination, position, is_visible, created_at
		FROM navigation_items
		WHERE site_id = $1 AND is_visible = true
		ORDER BY position ASC
	`

	rows, err := r.db.Query(query, siteID)
	if err != nil {
		return nil, fmt.Errorf("failed to list navigation items: %w", err)
	}
	defer rows.Close()

	var items []*models.NavigationItem
	for rows.Next() {
		item := &models.NavigationItem{}
		err := rows.Scan(&item.ID, &item.SiteID, &item.Label, &item.Type,
			&item.Destination, &item.Position, &item.IsVisible, &item.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan navigation item: %w", err)
		}
		items = append(items, item)
	}

	if items == nil {
		items = []*models.NavigationItem{}
	}

	return items, nil
}

func (r *NavigationRepository) ListAll(siteID string) ([]*models.NavigationItem, error) {
	query := `
		SELECT id, site_id, label, type, destination, position, is_visible, created_at
		FROM navigation_items
		WHERE site_id = $1
		ORDER BY position ASC
	`

	rows, err := r.db.Query(query, siteID)
	if err != nil {
		return nil, fmt.Errorf("failed to list navigation items: %w", err)
	}
	defer rows.Close()

	var items []*models.NavigationItem
	for rows.Next() {
		item := &models.NavigationItem{}
		err := rows.Scan(&item.ID, &item.SiteID, &item.Label, &item.Type,
			&item.Destination, &item.Position, &item.IsVisible, &item.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan navigation item: %w", err)
		}
		items = append(items, item)
	}

	if items == nil {
		items = []*models.NavigationItem{}
	}

	return items, nil
}

func (r *NavigationRepository) Update(id string, item *models.NavigationItem) error {
	query := `
		UPDATE navigation_items
		SET label = $2, type = $3, destination = $4, position = $5, is_visible = $6
		WHERE id = $1
	`

	_, err := r.db.Exec(query, id, item.Label, item.Type, item.Destination, item.Position, item.IsVisible)
	if err != nil {
		return fmt.Errorf("failed to update navigation item: %w", err)
	}

	return nil
}

func (r *NavigationRepository) Delete(id string) error {
	query := `DELETE FROM navigation_items WHERE id = $1`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete navigation item: %w", err)
	}
	return nil
}

func (r *NavigationRepository) DeleteBySite(siteID string) error {
	query := `DELETE FROM navigation_items WHERE site_id = $1`
	_, err := r.db.Exec(query, siteID)
	if err != nil {
		return fmt.Errorf("failed to delete navigation items: %w", err)
	}
	return nil
}
