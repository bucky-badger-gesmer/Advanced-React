import { PAGINATION_QUERY } from '../components/Pagination';

export default function PaginationField() {
  return {
    keyArgs: false, // tells apollo we will take care of everything
    read(existing = [], { args, cache }) {
      const { skip, first } = args;
      // read the number of items on the page from cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      // check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);
      // if there are items AND there aren't enough items to satisfy how many were requested
      // AND we are on the last page then just send it
      if (items.length && items.length !== first && page === pages)
        return items;
      if (items.length !== first) {
        // we don't have any items we must go to the network to fetch
        return false;
      }

      // if there are items, just return them from cache, we don't need to go to network
      if (items.length) {
        console.log(
          `there are ${items.length} in cache! gonna send them to apollo`
        );
        return items;
      }
      return false;

      // first it asks read function for those items
      // we can:
      // 1 return items because in cache
      // 2 return false from here (network request)
    },
    merge(existing, incoming, { args }) {
      const { skip, first } = args;
      // this runs when the apollo client comes back from the network with our product
      console.log(`merging items from the network ${incoming.length}`);
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; ++i) {
        merged[i] = incoming[i - skip];
      }

      return merged;
    },
  };
}
