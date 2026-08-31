package repositories

import (
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetPasswordHash() (string, error) {
	var hash string
	query := `SELECT password_hash FROM admin_user LIMIT 1`
	err := r.db.QueryRow(query).Scan(&hash)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to get admin password: %w", err)
	}
	return hash, nil
}

func (r *AdminRepository) VerifyPassword(password string) (bool, error) {
	hash, err := r.GetPasswordHash()
	if err != nil {
		return false, err
	}
	if hash == "" {
		return false, nil
	}

	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		return false, nil
	}
	return true, nil
}

func (r *AdminRepository) EnsureAdmin(password string) error {
	if password == "" {
		return nil
	}

	hash, err := r.GetPasswordHash()
	if err != nil {
		return err
	}
	if hash != "" {
		return nil
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	query := `INSERT INTO admin_user (id, password_hash) VALUES ($1, $2)`
	_, err = r.db.Exec(query, "00000000-0000-0000-0000-000000000001", string(hashed))
	if err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	return nil
}
