import React from 'react';
import './FeedFilters.css';

const FeedFilters = ({ filters, onFilterChange }) => {
    const handleFilterChange = (filterName, value) => {
        onFilterChange({
            ...filters,
            [filterName]: value
        });
    };

    return (
        <div className="feed-filters">
            <div className="filters-container">
                {/* Role Filter */}
                <div className="filter-group">
                    <label htmlFor="filterBy">User Role</label>
                    <select
                        id="filterBy"
                        value={filters.filterBy}
                        onChange={(e) => handleFilterChange('filterBy', e.target.value)}
                    >
                        <option value="all">All Users</option>
                        <option value="photographer">Photographers</option>
                        <option value="videographer">Videographers</option>
                        <option value="musician">Musicians</option>
                        <option value="artist">Artists</option>
                        <option value="user">Regular Users</option>
                    </select>
                </div>

                {/* Media Type Filter */}
                <div className="filter-group">
                    <label htmlFor="mediaType">Media Type</label>
                    <select
                        id="mediaType"
                        value={filters.mediaType}
                        onChange={(e) => handleFilterChange('mediaType', e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="photo">Photos</option>
                        <option value="video">Videos</option>
                    </select>
                </div>

                {/* Sort Filter */}
                <div className="filter-group">
                    <label htmlFor="sort">Sort By</label>
                    <select
                        id="sort"
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FeedFilters;
