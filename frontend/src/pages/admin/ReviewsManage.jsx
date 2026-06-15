import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';
import API from '../../services/api';
import Rating from '../../components/common/Rating';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const ReviewsManage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await API.get('/reviews');
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      toast.error('Failed to load reviews list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this customer review?');
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/reviews/${id}`);
      if (data.success) {
        toast.info('Review deleted.');
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Moderate Product Reviews</h2>

      {loading ? (
        <Skeleton height="300px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No customer reviews in database.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id}>
                    <td>
                      <strong>{rev.product?.name}</strong>
                    </td>
                    <td>
                      <strong>{rev.name || rev.user?.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rev.user?.email || 'N/A'}</span>
                    </td>
                    <td>
                      <Rating value={rev.rating} />
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      "{rev.comment}"
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteReview(rev._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewsManage;
