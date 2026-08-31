package config

import "os"

type Config struct {
	DatabaseURL   string
	Port          string
	JWTSecret     string
	CORSOrigin    string
	AdminPassword string
}

func Load() *Config {
	return &Config{
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://multiblog:multiblog_dev@localhost:5433/multiblog?sslmode=disable"),
		Port:          getEnv("PORT", "8080"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		CORSOrigin:    getEnv("CORS_ORIGIN", "http://localhost:3000"),
		AdminPassword: getEnv("ADMIN_PASSWORD", ""),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
