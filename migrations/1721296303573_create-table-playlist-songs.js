/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable("playlist_songs", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        playlist_id: {
            type: "VARCHAR(50)",
            references: "playlists(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
        song_id: {
            type: "VARCHAR(50)",
            references: "songs(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable("playlist_songs");
};
