package repositories

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/multiblog/api/internal/models"
)

type SiteRepository struct {
	db *sql.DB
}

func NewSiteRepository(db *sql.DB) *SiteRepository {
	return &SiteRepository{db: db}
}

func (r *SiteRepository) Create(req *models.CreateSiteRequest) (*models.Site, error) {
	language := req.Language
	if language == "" {
		language = "en"
	}

	site := &models.Site{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Language:    language,
	}

	query := `
		INSERT INTO sites (id, name, slug, description, language)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, site.ID, site.Name, site.Slug, site.Description, site.Language).
		Scan(&site.CreatedAt, &site.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create site: %w", err)
	}

	for _, hostname := range req.Domains {
		domain := &models.Domain{
			ID:        uuid.New().String(),
			SiteID:    site.ID,
			Hostname:  hostname,
			IsPrimary: len(req.Domains) == 1,
		}

		domainQuery := `
			INSERT INTO domains (id, site_id, hostname, is_primary)
			VALUES ($1, $2, $3, $4)
		`
		_, err := r.db.Exec(domainQuery, domain.ID, domain.SiteID, domain.Hostname, domain.IsPrimary)
		if err != nil {
			return nil, fmt.Errorf("failed to create domain: %w", err)
		}
	}

	return site, nil
}

func (r *SiteRepository) GetByID(id string) (*models.Site, error) {
	site := &models.Site{}
	query := `
		SELECT id, name, slug, description, language, created_at, updated_at
		FROM sites
		WHERE id = $1
	`

	err := r.db.QueryRow(query, id).Scan(
		&site.ID, &site.Name, &site.Slug, &site.Description, &site.Language,
		&site.CreatedAt, &site.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get site: %w", err)
	}

	return site, nil
}

func (r *SiteRepository) GetBySlug(slug string) (*models.Site, error) {
	site := &models.Site{}
	query := `
		SELECT id, name, slug, description, language, created_at, updated_at
		FROM sites
		WHERE slug = $1
	`

	err := r.db.QueryRow(query, slug).Scan(
		&site.ID, &site.Name, &site.Slug, &site.Description, &site.Language,
		&site.CreatedAt, &site.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get site: %w", err)
	}

	return site, nil
}

func (r *SiteRepository) GetByHostname(hostname string) (*models.Site, error) {
	site := &models.Site{}
	query := `
		SELECT s.id, s.name, s.slug, s.description, s.language, s.created_at, s.updated_at
		FROM sites s
		JOIN domains d ON s.id = d.site_id
		WHERE d.hostname = $1
	`

	err := r.db.QueryRow(query, hostname).Scan(
		&site.ID, &site.Name, &site.Slug, &site.Description, &site.Language,
		&site.CreatedAt, &site.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get site by hostname: %w", err)
	}

	return site, nil
}

func (r *SiteRepository) List() ([]*models.Site, error) {
	query := `
		SELECT id, name, slug, description, language, created_at, updated_at
		FROM sites
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list sites: %w", err)
	}
	defer rows.Close()

	var sites []*models.Site
	for rows.Next() {
		site := &models.Site{}
		err := rows.Scan(
			&site.ID, &site.Name, &site.Slug, &site.Description, &site.Language,
			&site.CreatedAt, &site.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan site: %w", err)
		}
		sites = append(sites, site)
	}

	if sites == nil {
		sites = []*models.Site{}
	}

	return sites, nil
}

func (r *SiteRepository) Update(id string, req *models.UpdateSiteRequest) (*models.Site, error) {
	site, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}
	if site == nil {
		return nil, nil
	}

	if req.Name != nil {
		site.Name = *req.Name
	}
	if req.Description != nil {
		site.Description = *req.Description
	}
	if req.Language != nil {
		site.Language = *req.Language
	}

	query := `
		UPDATE sites
		SET name = $2, description = $3, language = $4, updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at
	`

	err = r.db.QueryRow(query, id, site.Name, site.Description, site.Language).Scan(&site.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update site: %w", err)
	}

	return site, nil
}

func (r *SiteRepository) Delete(id string) error {
	query := `DELETE FROM sites WHERE id = $1`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete site: %w", err)
	}
	return nil
}

func (r *SiteRepository) GetDomains(siteID string) ([]*models.Domain, error) {
	query := `
		SELECT id, site_id, hostname, is_primary, created_at
		FROM domains
		WHERE site_id = $1
		ORDER BY is_primary DESC, created_at ASC
	`

	rows, err := r.db.Query(query, siteID)
	if err != nil {
		return nil, fmt.Errorf("failed to get domains: %w", err)
	}
	defer rows.Close()

	var domains []*models.Domain
	for rows.Next() {
		domain := &models.Domain{}
		err := rows.Scan(&domain.ID, &domain.SiteID, &domain.Hostname, &domain.IsPrimary, &domain.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan domain: %w", err)
		}
		domains = append(domains, domain)
	}

	return domains, nil
}

func (r *SiteRepository) AddDomain(siteID, hostname string, isPrimary bool) (*models.Domain, error) {
	domain := &models.Domain{
		ID:        uuid.New().String(),
		SiteID:    siteID,
		Hostname:  hostname,
		IsPrimary: isPrimary,
	}

	query := `
		INSERT INTO domains (id, site_id, hostname, is_primary)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at
	`

	err := r.db.QueryRow(query, domain.ID, domain.SiteID, domain.Hostname, domain.IsPrimary).
		Scan(&domain.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to add domain: %w", err)
	}

	return domain, nil
}

func (r *SiteRepository) DeleteDomain(id string) error {
	query := `DELETE FROM domains WHERE id = $1`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete domain: %w", err)
	}
	return nil
}
