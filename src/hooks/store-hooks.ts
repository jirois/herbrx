// import {   StoreProductsResponse, StoreProductResponse } from "@/types";

// export function useStoreProducts(params?: {
//     category?: string
//     search?: string
// }){
//     const query = new URLSearchParams()

//     if (params?.category)
//         query.set("category", params.category)

//     if (params?.search)
//         query.set("search", params.search)

//     const qs = query.toString()

//     return useFetch<StoreProductsResponse>(
//     `/api/store/products${qs ? `?${qs}` : ""}`
//   )
// }
// /**
//  * Product Detail
//  *
//  * const { data } = useStoreProduct(slug)
//  */
// export function useStoreProduct(slug?: string) {
//     const url = slug 
//        ? `/api/store/products/${slug}`
//        : null;

//      return useFetch<StoreProductResponse>(url)
// }

// /**
//  * Category Products
//  */
// export function useCategoryProducts(category: string) {
//     return useFetch<StoreProductResponse>(
//         `/api/store/products?category=${encodeURIComponent(category)}`
//     )
// }

// /**
//  * Search Products
//  */
// export function useSearchProducts(search: string) {
//     return useFetch<StoreProductsResponse>(
//         `/api/store/products?search=${encodeURIComponent(search)}`
//     )
// }