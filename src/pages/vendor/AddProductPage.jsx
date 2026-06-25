import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getVendorCategories,
  createVendorProduct,
  uploadProductImage,
} from '../../api/vendorApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import ProductForm from '../../components/vendor/ProductForm';
import './vendorPages.css';

export default function AddProductPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    getVendorCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : data?.content || []))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load categories')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (values) => {
    try {
      const product = await createVendorProduct(values);
      // Upload any selected images now that we have a product id.
      if (files.length && product?.id) {
        for (let i = 0; i < files.length; i++) {
          try {
            await uploadProductImage(product.id, files[i], i === 0);
          } catch {
            toast.error(`Image "${files[i].name}" failed to upload`);
          }
        }
      }
      toast.success('Product created');
      navigate('/vendor/products');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not create product'));
    }
  };

  return (
    <div>
      <div className="vp-head">
        <div>
          <Link to="/vendor/products" className="od-back">← Back to products</Link>
          <h1>Add Product</h1>
        </div>
      </div>

      <ProductForm
        categories={categories}
        submitLabel="Create Product"
        onSubmit={handleCreate}
        onCancel={() => navigate('/vendor/products')}
        files={files}
        onFilesPicked={setFiles}
      />
    </div>
  );
}
