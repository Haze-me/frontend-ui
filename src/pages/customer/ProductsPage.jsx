import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getProductsSorted, getCategories } from '../../api/catalogApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/common/ProductCard';
import Pagination from '../../components/common/Pagination';
import './productsPage.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

function CardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 0 }} />
      <div className="pc-body">
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div className="skeleton" style={{ height: 16, width: '90%' }} />
        <div className="skeleton" style={{ height: 20, width: '50%', marginTop: 8 }} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  // URL is the source of truth for all filters (shareable + back/forward works).
  const search = params.get('search') || '';
  const categoryId = params.get('categoryId') || '';
  const brand = params.get('brand') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sortBy = params.get('sortBy') || 'newest';
  const page = parseInt(params.get('page') || '0', 10);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Local input state for the search box & price range (committed on submit).
  const [searchInput, setSearchInput] = useState(search);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => setMinInput(minPrice), [minPrice]);
  useEffect(() => setMaxInput(maxPrice), [maxPrice]);

  // Load categories + a broad sample to populate the brand filter once.
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : data?.content || []))
      .catch(() => {});
    getProducts({ page: 0, size: 100 })
      .then((data) => {
        const set = new Set(
          (data?.content || []).map((p) => p.brand).filter(Boolean)
        );
        setBrands([...set].sort());
      })
      .catch(() => {});
  }, []);

  // Merge a set of changes into the URL params. Any filter change resets page
  // to 0 unless the change *is* the page itself.
  const update = useCallback(
    (changes) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) next.delete(k);
        else next.set(k, v);
      });
      if (!('page' in changes)) next.delete('page');
      setParams(next);
    },
    [params, setParams]
  );

  // Fetch products whenever any filter in the URL changes.
  useEffect(() => {
    let active = true;
    setLoading(true);

    const query = { page, size: PAGE_SIZE, sortBy };
    if (search) query.search = search;
    if (categoryId) query.categoryId = categoryId;
    if (brand) query.brand = brand;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;

    getProductsSorted(query)
      .then((data) => {
        if (!active) return;
        setProducts(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      })
      .catch((err) => {
        if (!active) return;
        toast.error(getApiErrorMessage(err, 'Could not load products'));
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, brand, minPrice, maxPrice, sortBy, page]);

  const submitSearch = (e) => {
    e.preventDefault();
    update({ search: searchInput.trim() });
  };

  const applyPrice = (e) => {
    e.preventDefault();
    update({ minPrice: minInput, maxPrice: maxInput });
    setFiltersOpen(false);
  };

  const clearAll = () => {
    setParams(new URLSearchParams());
    setFiltersOpen(false);
  };

  const hasFilters =
    search || categoryId || brand || minPrice || maxPrice;

  const sidebar = (
    <aside className={`filters ${filtersOpen ? 'open' : ''}`}>
      <div className="filters-head">
        <h3>Filters</h3>
        {hasFilters && (
          <button className="clear-link" onClick={clearAll}>
            Clear all
          </button>
        )}
        <button className="filters-close" onClick={() => setFiltersOpen(false)}>
          ✕
        </button>
      </div>

      {/* Categories */}
      <div className="filter-group">
        <h4>Category</h4>
        <ul className="filter-list">
          <li>
            <button
              className={!categoryId ? 'active' : ''}
              onClick={() => {
                update({ categoryId: '' });
                setFiltersOpen(false);
              }}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.categoryId}>
              <button
                className={String(categoryId) === String(c.categoryId) ? 'active' : ''}
                onClick={() => {
                  update({ categoryId: c.categoryId });
                  setFiltersOpen(false);
                }}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className="filter-group">
        <h4>Price range (₦)</h4>
        <form className="price-row" onSubmit={applyPrice}>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
          />
          <span>–</span>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">Go</button>
        </form>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="filter-group">
          <h4>Brand</h4>
          <ul className="filter-list">
            <li>
              <button
                className={!brand ? 'active' : ''}
                onClick={() => {
                  update({ brand: '' });
                  setFiltersOpen(false);
                }}
              >
                All brands
              </button>
            </li>
            {brands.map((b) => (
              <li key={b}>
                <button
                  className={brand === b ? 'active' : ''}
                  onClick={() => {
                    update({ brand: b });
                    setFiltersOpen(false);
                  }}
                >
                  {b}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );

  return (
    <div className="page">
      <div className="container products-layout">
        {filtersOpen && (
          <div className="filters-overlay" onClick={() => setFiltersOpen(false)} />
        )}
        {sidebar}

        <div className="products-main">
          {/* Top bar: search + sort */}
          <div className="products-topbar">
            <form className="products-search" onSubmit={submitSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>

            <div className="topbar-right">
              <button
                className="btn btn-outline btn-sm filters-toggle"
                onClick={() => setFiltersOpen(true)}
              >
                ☰ Filters
              </button>
              <select
                className="select sort-select"
                value={sortBy}
                onChange={(e) => update({ sortBy: e.target.value })}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result meta + active filter chips */}
          <div className="results-meta">
            <span>
              {loading
                ? 'Loading…'
                : `${totalElements} product${totalElements === 1 ? '' : 's'} found`}
            </span>
            <div className="chips">
              {search && (
                <span className="chip" onClick={() => update({ search: '' })}>
                  “{search}” ✕
                </span>
              )}
              {brand && (
                <span className="chip" onClick={() => update({ brand: '' })}>
                  {brand} ✕
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span
                  className="chip"
                  onClick={() => update({ minPrice: '', maxPrice: '' })}
                >
                  ₦{minPrice || '0'}–{maxPrice || '∞'} ✕
                </span>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="prod-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
              {hasFilters && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={clearAll}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p) => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => {
              update({ page: String(p) });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </div>
  );
}
