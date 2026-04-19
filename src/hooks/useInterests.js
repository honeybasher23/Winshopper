import { useState, useEffect } from 'react';

export const useInterests = () => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      // 1. Try to get Google Topics (Chrome/Android only)
      if ('browsingTopics' in document) {
        try {
          const browsingTopics = await document.browsingTopics();
          // Returns array like: [{ topic: 304, version: "..." }]
          // You would map these IDs to readable tags
          console.log("User Topics found:", browsingTopics);
          setTopics(browsingTopics);
        } catch (e) {
          console.log("Topics API blocked or failed", e);
        }
      }
    };

    fetchTopics();
  }, []);

  return topics;
};