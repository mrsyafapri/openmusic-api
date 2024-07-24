/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable("user_album_likes", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        user_id: {
            type: "VARCHAR(50)",
            references: "users(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
        album_id: {
            type: "VARCHAR(50)",
            references: "albums(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
    });

    // Add a unique constraint on user_id and album_id
    pgm.addConstraint(
        "user_album_likes",
        "unique_user_album",
        "UNIQUE(user_id, album_id)"
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop the unique constraint
    pgm.dropConstraint("user_album_likes", "unique_user_album");

    // Drop the table
    pgm.dropTable("user_album_likes");
};
