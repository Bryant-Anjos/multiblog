package models

import "time"

type Site struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description,omitempty"`
	Language    string    `json:"language,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Domain struct {
	ID        string    `json:"id"`
	SiteID    string    `json:"site_id"`
	Hostname  string    `json:"hostname"`
	IsPrimary bool      `json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}

type PostStatus string

const (
	PostStatusDraft     PostStatus = "DRAFT"
	PostStatusPublished PostStatus = "PUBLISHED"
)

type Post struct {
	ID          string     `json:"id"`
	SiteID      string     `json:"site_id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Content     string     `json:"content"`
	Excerpt     string     `json:"excerpt,omitempty"`
	Status      PostStatus `json:"status"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type Page struct {
	ID        string     `json:"id"`
	SiteID    string     `json:"site_id"`
	Title     string     `json:"title"`
	Slug      string     `json:"slug"`
	Content   string     `json:"content"`
	Status    PostStatus `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type Story struct {
	ID               string    `json:"id"`
	SiteID           string    `json:"site_id"`
	Title            string    `json:"title"`
	Slug             string    `json:"slug"`
	Description      string    `json:"description,omitempty"`
	ParentStoryID    *string   `json:"parent_story_id,omitempty"`
	RelationshipType *string   `json:"relationship_type,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type StoryGroup struct {
	ID        string    `json:"id"`
	StoryID   string    `json:"story_id"`
	Title     string    `json:"title"`
	Slug      string    `json:"slug"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Chapter struct {
	ID          string     `json:"id"`
	StoryID     string     `json:"story_id"`
	GroupID     *string    `json:"group_id,omitempty"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Content     string     `json:"content"`
	Position    int        `json:"position"`
	Status      PostStatus `json:"status"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type NavigationItem struct {
	ID          string    `json:"id"`
	SiteID      string    `json:"site_id"`
	Label       string    `json:"label"`
	Type        string    `json:"type"`
	Destination string    `json:"destination"`
	Position    int       `json:"position"`
	IsVisible   bool      `json:"is_visible"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateSiteRequest struct {
	Name        string   `json:"name"`
	Slug        string   `json:"slug"`
	Description string   `json:"description,omitempty"`
	Language    string   `json:"language,omitempty"`
	Domains     []string `json:"domains,omitempty"`
}

type UpdateSiteRequest struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	Language    *string `json:"language,omitempty"`
}

type CreatePostRequest struct {
	Title   string     `json:"title"`
	Slug    string     `json:"slug"`
	Content string     `json:"content"`
	Excerpt string     `json:"excerpt,omitempty"`
	Status  PostStatus `json:"status,omitempty"`
}

type UpdatePostRequest struct {
	Title   *string     `json:"title,omitempty"`
	Content *string     `json:"content,omitempty"`
	Excerpt *string     `json:"excerpt,omitempty"`
	Status  *PostStatus `json:"status,omitempty"`
}

type CreatePageRequest struct {
	Title   string     `json:"title"`
	Slug    string     `json:"slug"`
	Content string     `json:"content"`
	Status  PostStatus `json:"status,omitempty"`
}

type CreateStoryRequest struct {
	Title            string  `json:"title"`
	Slug             string  `json:"slug"`
	Description      string  `json:"description,omitempty"`
	ParentStoryID    *string `json:"parent_story_id,omitempty"`
	RelationshipType *string `json:"relationship_type,omitempty"`
}

type CreateChapterRequest struct {
	GroupID *string    `json:"group_id,omitempty"`
	Title   string     `json:"title"`
	Slug    string     `json:"slug"`
	Content string     `json:"content"`
	Status  PostStatus `json:"status,omitempty"`
}

type LoginRequest struct {
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}
