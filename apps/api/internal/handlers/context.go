package handlers

import (
	"context"

	"github.com/multiblog/api/internal/models"
)

type contextKey string

const siteContextKey contextKey = "site"

func contextWithSite(ctx context.Context, pc *publicContext) context.Context {
	return context.WithValue(ctx, siteContextKey, pc)
}

func siteFromContext(ctx context.Context) *publicContext {
	if pc, ok := ctx.Value(siteContextKey).(*publicContext); ok {
		return pc
	}
	return &publicContext{}
}

func (c *publicContext) Site() *models.Site {
	if c == nil {
		return nil
	}
	return c.site
}
