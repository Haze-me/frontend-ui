import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getVendorProduct,
  getVendorCategories,
  updateVendorProduct,
  uploadProductImage,
} from '../../api/vendorApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import ProductForm from '../../components/vendor/ProductForm';
import Spinner from '../../components/common/Spinner';
import './vendorPages.css';

function extractImages(product) {
  const imgs = product?.images;
  if (!Array.isArray(imgs)) return [];
  return imgs
    .map((i) => (typeof i === 'string' ? i : i?.imageUrl || i?.url))
    .filter(Boolean);
}

function extractCategoryId(product) {
  if (!product) return '';
  if (product.categoryId) return product.categoryId;
  if (product.category && typeof product.category === 'object') return product.category.id;
  return product.category || '';
}

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [p, cats] = await Promise.all([
        getVendorProduct(productId),
        getVendorCategories().catch(() => []),
      ]);
      setProduct(p);
      setExistingImages(extractImages(p));
      setCategories(Array.isArray(cats) ? cats : cats?.content || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load product'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleUpdate = async (values) => {
    try {
      await updateVendorProduct(productId, values);
      // Upload any newly picked images as part of the same save.
      if (files.length) {
        let failed = 0;
        for (let i = 0; i < files.length; i++) {
          try {
            await uploadProductImage(productId, files[i], existingImages.length === 0 && i === 0);
          } catch {
            failed += 1;
          }
        }
        if (failed) toast.error(`${failed} image${failed === 1 ? '' : 's'} failed to upload`);
      }
      toast.success('Product saved');
      navigate('/vendor/products');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update product'));
    }
  };

  if (loading) return <Spinner fullPage />;

  if (!product) {
    return (
      <div className="empty-state">
        <h3>Product not found</h3>
        <Link to="/vendor/products" className="btn btn-primary" style={{ marginTop: 14 }}>Back to products</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="vp-head">
        <div>
          <Link to="/vendor/products" className="od-back">← Back to products</Link>
          <h1>Edit Product</h1>
        </div>
      </div>

      <ProductForm
        categories={categories}
        initial={{ ...product, categoryId: extractCategoryId(product) }}
        submitLabel="Save Changes"
        onSubmit={handleUpdate}
        onCancel={() => navigate('/vendor/products')}
        existingImages={existingImages}
        files={files}
        onFilesPicked={setFiles}
      />
    </div>
  );
}
