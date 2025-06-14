import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductName = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
`;

const ProductDescription = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
`;

const ProductCategory = styled.div`
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCardClick = () => {
    // You can add navigation to product details or add to cart functionality here
    console.log('Product clicked:', product);
  };

  return (
    <Card onClick={handleCardClick}>
      <ProductName>{product.name}</ProductName>
      {product.description && (
        <ProductDescription>{product.description}</ProductDescription>
      )}
      {product.price && (
        <ProductPrice>{formatPrice(product.price)}</ProductPrice>
      )}
      {product.category && (
        <ProductCategory>{product.category}</ProductCategory>
      )}
    </Card>
  );
}

export default ProductCard;
