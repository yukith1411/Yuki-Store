import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders, FiXCircle, FiInbox } from 'react-icons/fi';
import API from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import Skeleton from '../../components/common/Skeleton';
import '../../css/shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Categories & Brands list
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sort, setSort] = useState('newest');

  // Hardcoded Size & Color options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11'];
  const colorOptions = [
    { name: 'Red', hex: '#ff4757' },
    { name: 'Blue', hex: '#1e90ff' },
    { name: 'Black', hex: '#2f3542' },
    { name: 'Yellow', hex: '#ffa502' },
    { name: 'Pink', hex: '#ff6b81' },
    { name: 'White', hex: '#ffffff', border: '#ced6e0' },
    { name: 'Beige', hex: '#f5f5dc' },
    { name: 'Silver', hex: '#c0c0c0' },
    { name: 'Brown', hex: '#a52a2a' }
  ];

  // Fetch filter metadata (categories, brands)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          API.get('/categories'),
          API.get('/brands')
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories.filter(c => c.active));
        if (brandRes.data.success) setBrands(brandRes.data.brands.filter(b => b.active));
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  // Parse URL search params (e.g. from Home page link redirects)
  useEffect(() => {
    const catParam = searchParams.get('category');
    const brandParam = searchParams.get('brand');
    const searchParam = searchParams.get('search');

    if (catParam) setSelectedCategories([catParam]);
    if (brandParam) setSelectedBrands([brandParam]);
    if (searchParam) setSearch(searchParam);
  }, [searchParams]);

  // Fetch Products based on filter states
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `/products?page=${page}&limit=9&sort=${sort}`;

      if (search) query += `&keyword=${encodeURIComponent(search)}`;
      if (selectedCategories.length > 0) query += `&category=${selectedCategories.join(',')}`;
      if (selectedBrands.length > 0) query += `&brand=${selectedBrands.join(',')}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;
      if (selectedSizes.length > 0) query += `&size=${selectedSizes.join(',')}`;
      if (selectedColors.length > 0) query += `&color=${selectedColors.join(',')}`;

      const { data } = await API.get(query);
      if (data.success) {
        setProducts(data.products);
        setPages(data.pages);
        setTotalProducts(data.total);
      }
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort, selectedCategories, selectedBrands, selectedSizes, selectedColors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Toggle Filters helpers
  const handleCategoryChange = (slug) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const handleBrandChange = (slug) => {
    setPage(1);
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    );
  };

  const handleSizeToggle = (size) => {
    setPage(1);
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (colorName) => {
    setPage(1);
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container section">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>All Departments</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Browse thousands of products across all departments.</p>

      {/* Search & Header Row */}
      <div className="shop-header">
        <button
          className="mobile-filter-trigger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FiSliders /> Filters
        </button>

        <form className="shop-search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="shop-search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="shop-search-btn" aria-label="Search">
            <FiSearch />
          </button>
        </form>

        <div className="shop-sorting">
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sort By</span>
          <select
            className="shop-sorting-select"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="shop-page-wrapper">
        {/* Sidebar Filters */}
        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>Filters</span>
            <button
              onClick={clearAllFilters}
              style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
            >
              <FiXCircle /> Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-block">
            <h3 className="filter-title">Categories</h3>
            <div className="filter-list">
              {categories.map((cat) => (
                <label key={cat._id} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryChange(cat.slug)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="filter-block">
            <h3 className="filter-title">Brands</h3>
            <div className="filter-list">
              {brands.map((brand) => (
                <label key={brand._id} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={() => handleBrandChange(brand.slug)}
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-block">
            <h3 className="filter-title">Price Range</h3>
            <div className="price-filter-row">
              <input
                type="number"
                placeholder="Min"
                className="price-filter-input"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                className="price-filter-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem' }}
                onClick={() => { setPage(1); fetchProducts(); }}
              >
                Go
              </button>
            </div>
          </div>

          {/* Size Filter */}
          <div className="filter-block">
            <h3 className="filter-title">Filter by Size</h3>
            <div className="size-filter-grid">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  className={`size-filter-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="filter-block">
            <h3 className="filter-title">Filter by Color</h3>
            <div className="color-filter-grid">
              {colorOptions.map((col) => (
                <button
                  key={col.name}
                  className={`color-filter-btn ${selectedColors.includes(col.name) ? 'active' : ''}`}
                  style={{
                    backgroundColor: col.hex,
                    border: col.border ? `1px solid ${col.border}` : undefined
                  }}
                  onClick={() => handleColorToggle(col.name)}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="shop-content">
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Showing {products.length} of {totalProducts} products
          </div>

          {loading ? (
            <div className="products-grid">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} height="400px" borderRadius="8px" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <FiInbox className="empty-state-icon" />
              <h2>No Products Found</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
                We couldn't find any products matching your filter options..
              </p>
              <button className="btn btn-primary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    &laquo;
                  </button>
                  {Array.from({ length: pages }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`pagination-btn ${idx + 1 === page ? 'active' : ''}`}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    disabled={page === pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
