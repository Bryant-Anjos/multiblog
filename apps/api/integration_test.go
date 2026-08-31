package main

import (
	"database/sql"
	"os"
	"testing"

	_ "github.com/lib/pq"

	"github.com/google/uuid"
	"github.com/multiblog/api/internal/models"
	"github.com/multiblog/api/internal/repositories"
)

func testDB(t *testing.T) *sql.DB {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		url = "postgres://multiblog:multiblog_dev@localhost:5433/multiblog?sslmode=disable"
	}
	db, err := sql.Open("postgres", url)
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.Ping(); err != nil {
		t.Fatalf("failed to ping db: %v", err)
	}
	return db
}

// cleanupSite removes all test data that references a given site id.
func cleanupSite(t *testing.T, db *sql.DB, siteID string) {
	t.Helper()
	for _, q := range []string{
		`DELETE FROM navigation_items WHERE site_id = $1`,
		`DELETE FROM posts WHERE site_id = $1`,
		`DELETE FROM pages WHERE site_id = $1`,
		`DELETE FROM domains WHERE site_id = $1`,
		`DELETE FROM sites WHERE id = $1`,
	} {
		if _, err := db.Exec(q, siteID); err != nil {
			t.Logf("cleanup query failed (may be ok): %v", err)
		}
	}
	// stories cascade via postgres; delete independently to be safe
	if _, err := db.Exec(`DELETE FROM stories WHERE site_id = $1`, siteID); err != nil {
		t.Logf("cleanup stories failed: %v", err)
	}
}

func TestSiteResolutionByHostname(t *testing.T) {
	db := testDB(t)
	repo := repositories.NewSiteRepository(db)

	slug := "test-resolve-" + uuid.NewString()[:8]
	host := "resolve-" + uuid.NewString()[:8] + ".localhost"

	site, err := repo.Create(&models.CreateSiteRequest{
		Name:    "Resolution Test",
		Slug:    slug,
		Domains: []string{host},
	})
	if err != nil {
		t.Fatalf("create site: %v", err)
	}
	defer cleanupSite(t, db, site.ID)

	// Exact hostname must resolve to the correct site.
	got, err := repo.GetByHostname(host)
	if err != nil {
		t.Fatalf("get by hostname: %v", err)
	}
	if got == nil || got.ID != site.ID {
		t.Fatalf("expected site %s for hostname %s, got %+v", site.ID, host, got)
	}

	// Unknown hostname must resolve to nothing.
	missing, err := repo.GetByHostname("definitely-not-configured.localhost")
	if err != nil {
		t.Fatalf("get missing hostname: %v", err)
	}
	if missing != nil {
		t.Fatalf("expected nil for unknown hostname, got %+v", missing)
	}
}

func TestSiteResolutionBySlug(t *testing.T) {
	db := testDB(t)
	repo := repositories.NewSiteRepository(db)

	slug := "test-slug-" + uuid.NewString()[:8]
	site, err := repo.Create(&models.CreateSiteRequest{Name: "Slug Test", Slug: slug})
	if err != nil {
		t.Fatalf("create site: %v", err)
	}
	defer cleanupSite(t, db, site.ID)

	got, err := repo.GetBySlug(slug)
	if err != nil {
		t.Fatalf("get by slug: %v", err)
	}
	if got == nil || got.ID != site.ID {
		t.Fatalf("expected site by slug, got %+v", got)
	}
}

func TestContentIsolation(t *testing.T) {
	db := testDB(t)
	siteRepo := repositories.NewSiteRepository(db)
	postRepo := repositories.NewPostRepository(db)

	// Site A
	slugA := "iso-a-" + uuid.NewString()[:8]
	siteA, err := siteRepo.Create(&models.CreateSiteRequest{Name: "Isolation A", Slug: slugA})
	if err != nil {
		t.Fatalf("create A: %v", err)
	}
	defer cleanupSite(t, db, siteA.ID)

	// Site B
	slugB := "iso-b-" + uuid.NewString()[:8]
	siteB, err := siteRepo.Create(&models.CreateSiteRequest{Name: "Isolation B", Slug: slugB})
	if err != nil {
		t.Fatalf("create B: %v", err)
	}
	defer cleanupSite(t, db, siteB.ID)

	postA, err := postRepo.Create(siteA.ID, &models.CreatePostRequest{
		Title:   "Secret of A",
		Slug:    "secret-of-a-" + uuid.NewString()[:8],
		Content: "For site A only",
		Status:  models.PostStatusPublished,
	})
	if err != nil {
		t.Fatalf("create post A: %v", err)
	}

	// Site B must not be able to fetch Site A's post by ID.
	gotByB, err := postRepo.GetByID(siteB.ID, postA.ID)
	if err != nil {
		t.Fatalf("get post A via B: %v", err)
	}
	if gotByB != nil {
		t.Fatalf("content leaked across sites: site B accessed site A's post")
	}

	// Site B's post list must not include Site A's post.
	postsB, err := postRepo.ListPublished(siteB.ID)
	if err != nil {
		t.Fatalf("list posts B: %v", err)
	}
	for _, p := range postsB {
		if p.ID == postA.ID {
			t.Fatalf("content leaked: post A present in site B's list")
		}
	}
}

func TestPublishingBehavior(t *testing.T) {
	db := testDB(t)
	siteRepo := repositories.NewSiteRepository(db)
	postRepo := repositories.NewPostRepository(db)

	slug := "pub-" + uuid.NewString()[:8]
	site, err := siteRepo.Create(&models.CreateSiteRequest{Name: "Publishing", Slug: slug})
	if err != nil {
		t.Fatalf("create site: %v", err)
	}
	defer cleanupSite(t, db, site.ID)

	draft, err := postRepo.Create(site.ID, &models.CreatePostRequest{
		Title:   "Draft Post",
		Slug:    "draft-post-" + uuid.NewString()[:8],
		Content: "not ready",
		Status:  models.PostStatusDraft,
	})
	if err != nil {
		t.Fatalf("create draft: %v", err)
	}

	// Draft must NOT appear in published list.
	publishedList, err := postRepo.ListPublished(site.ID)
	if err != nil {
		t.Fatalf("list published: %v", err)
	}
	for _, p := range publishedList {
		if p.ID == draft.ID {
			t.Fatalf("draft appeared in published list")
		}
	}

	// Publish it.
	published := models.PostStatusPublished
	updated, err := postRepo.Update(site.ID, draft.ID, &models.UpdatePostRequest{Status: &published})
	if err != nil {
		t.Fatalf("publish: %v", err)
	}
	if updated.Status != models.PostStatusPublished {
		t.Fatalf("expected PUBLISHED status, got %s", updated.Status)
	}
	if updated.PublishedAt == nil {
		t.Fatalf("expected published_at to be set")
	}

	// Now it must appear in published list.
	publishedList2, err := postRepo.ListPublished(site.ID)
	if err != nil {
		t.Fatalf("list published 2: %v", err)
	}
	found := false
	for _, p := range publishedList2 {
		if p.ID == draft.ID {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("published post missing from published list")
	}
}

func TestStoryOrganization(t *testing.T) {
	db := testDB(t)
	siteRepo := repositories.NewSiteRepository(db)
	storyRepo := repositories.NewStoryRepository(db)

	slug := "story-" + uuid.NewString()[:8]
	site, err := siteRepo.Create(&models.CreateSiteRequest{Name: "Stories", Slug: slug})
	if err != nil {
		t.Fatalf("create site: %v", err)
	}
	defer cleanupSite(t, db, site.ID)

	main, err := storyRepo.Create(site.ID, &models.CreateStoryRequest{
		Title: "Main Story",
		Slug:  "main-story-" + uuid.NewString()[:8],
	})
	if err != nil {
		t.Fatalf("create main story: %v", err)
	}

	rt := "SPINOFF"
	spinoff, err := storyRepo.Create(site.ID, &models.CreateStoryRequest{
		Title:           "Spin-off",
		Slug:            "spinoff-" + uuid.NewString()[:8],
		ParentStoryID:   &main.ID,
		RelationshipType: &rt,
	})
	if err != nil {
		t.Fatalf("create spin-off: %v", err)
	}

	// Groups
	group, err := storyRepo.CreateGroup(main.ID, "Book 1", "book-1", 1)
	if err != nil {
		t.Fatalf("create group: %v", err)
	}

	// Chapters in order
	_, err = storyRepo.CreateChapter(main.ID, &models.CreateChapterRequest{
		Title:   "Chapter One",
		Slug:    "chapter-one-" + uuid.NewString()[:8],
		Content: "first",
		GroupID: &group.ID,
		Status:  models.PostStatusPublished,
	})
	if err != nil {
		t.Fatalf("create ch1: %v", err)
	}

	ch2, err := storyRepo.CreateChapter(main.ID, &models.CreateChapterRequest{
		Title:   "Chapter Two",
		Slug:    "chapter-two-" + uuid.NewString()[:8],
		Content: "second",
		GroupID: &group.ID,
		Status:  models.PostStatusPublished,
	})
	if err != nil {
		t.Fatalf("create ch2: %v", err)
	}

	// Chapters must be ordered by position ascending.
	chapters, err := storyRepo.GetChaptersByGroup(main.ID, group.ID)
	if err != nil {
		t.Fatalf("get chapters by group: %v", err)
	}
	if len(chapters) != 2 {
		t.Fatalf("expected 2 chapters, got %d", len(chapters))
	}
	if chapters[0].Position >= chapters[1].Position {
		t.Fatalf("chapters not in position order: %d, %d", chapters[0].Position, chapters[1].Position)
	}
	if chapters[0].ID == ch2.ID {
		t.Fatalf("chapter two inserted before chapter one")
	}

	// The spin-off must NOT appear in the main story's chapter flow.
	dirty, err := storyRepo.GetChapter(main.ID, spinoff.ID)
	if err != nil {
		t.Fatalf("get chapter (should be none): %v", err)
	}
	if dirty != nil {
		t.Fatalf("spin-off leaked into main story chapter flow")
	}

	// Both main and spin-off listed via ListWithSpinoffs
	all, err := storyRepo.ListWithSpinoffs(site.ID)
	if err != nil {
		t.Fatalf("list with spinoffs: %v", err)
	}
	foundMain, foundSpin := false, false
	for _, s := range all {
		if s.ID == main.ID {
			foundMain = true
		}
		if s.ID == spinoff.ID {
			foundSpin = true
		}
	}
	if !foundMain || !foundSpin {
		t.Fatalf("expected both main and spin-off stories in list")
	}
}

func TestHostnameIsolationAcrossSites(t *testing.T) {
	db := testDB(t)
	repo := repositories.NewSiteRepository(db)

	hostA := "host-a-" + uuid.NewString()[:8] + ".localhost"
	hostB := "host-b-" + uuid.NewString()[:8] + ".localhost"

	a, err := repo.Create(&models.CreateSiteRequest{Name: "Host A", Slug: "host-a-" + uuid.NewString()[:8], Domains: []string{hostA}})
	if err != nil {
		t.Fatalf("create A: %v", err)
	}
	defer cleanupSite(t, db, a.ID)

	b, err := repo.Create(&models.CreateSiteRequest{Name: "Host B", Slug: "host-b-" + uuid.NewString()[:8], Domains: []string{hostB}})
	if err != nil {
		t.Fatalf("create B: %v", err)
	}
	defer cleanupSite(t, db, b.ID)

	// A's hostname resolves to A, not B.
	ra, err := repo.GetByHostname(hostA)
	if err != nil {
		t.Fatalf("resolve A: %v", err)
	}
	if ra.ID != a.ID {
		t.Fatalf("hostname A resolved to wrong site: %s", ra.ID)
	}

	rb, err := repo.GetByHostname(hostB)
	if err != nil {
		t.Fatalf("resolve B: %v", err)
	}
	if rb.ID != b.ID {
		t.Fatalf("hostname B resolved to wrong site: %s", rb.ID)
	}
}
