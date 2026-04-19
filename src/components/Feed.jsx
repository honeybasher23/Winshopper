import React, { useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import HoloCard from './HoloCard'; // The card we designed earlier
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Use your keys from Project Settings)
const supabase = createClient('VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY');

const Feed = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // In a real app, we would generate a 'query_embedding' based on the 
    // user's topics from useInterests() and pass it here.
    // For now, we fetch all to test the UI.
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(50);
      
      if (data) setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="h-screen w-full bg-neutral-900 flex justify-center">
      {/* The Virtualized List */}
      <Virtuoso
        style={{ height: '100%', width: '100%', maxWidth: '500px' }}
        data={products}
        // Footer adds some breathing room at the bottom
        components={{ Footer: () => <div className="h-20" /> }} 
        itemContent={(index, product) => (
          <div className="py-6 flex justify-center">
            <HoloCard product={product} />
          </div>
        )}
      />
    </div>
  );
};

export default Feed;