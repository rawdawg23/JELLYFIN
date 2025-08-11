import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface MarketplaceItem {
  id: string
  title: string
  description: string
  price: number
  currency: "GBP"
  category: "themes" | "plugins" | "configs" | "media" | "services" | "hardware" | "servers" | "content"
  condition: "new" | "like-new" | "good" | "fair" | "poor" | "used" | "refurbished"
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerVerified: boolean
  location: string
  shipping: {
    available: boolean
    cost: number
    methods: string[]
  }
  tags: string[]
  status: "pending" | "active" | "sold" | "rejected"
  createdAt: Date
  updatedAt: Date
  views: number
  favorites: number
  reports: number
  featured: boolean
}

export interface MarketplaceFilter {
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  location?: string
  verified?: boolean
  search?: string
  status?: string
}

export interface SellerStats {
  totalListings: number
  activeListings: number
  soldItems: number
  totalEarnings: number
  averageRating: number
  totalViews: number
  totalFavorites: number
}

interface MarketplaceStore {
  items: MarketplaceItem[]
  filters: MarketplaceFilter
  viewMode: "grid" | "list"
  sortBy: "newest" | "oldest" | "price-low" | "price-high" | "popular"

  // Actions
  setItems: (items: MarketplaceItem[]) => void
  addItem: (
    item: Omit<
      MarketplaceItem,
      "id" | "createdAt" | "updatedAt" | "views" | "favorites" | "reports" | "sellerRating" | "featured"
    >,
  ) => void
  updateItem: (id: string, updates: Partial<MarketplaceItem>) => void
  deleteItem: (id: string) => void
  setFilters: (filters: MarketplaceFilter) => void
  setViewMode: (mode: "grid" | "list") => void
  setSortBy: (sort: "newest" | "oldest" | "price-low" | "price-high" | "popular") => void
  getFilteredItems: () => MarketplaceItem[]
  getUserItems: (userId: string) => MarketplaceItem[]
  getSellerStats: (sellerId: string) => SellerStats
  reportItem: (id: string) => void
  favoriteItem: (id: string) => void
  incrementViews: (id: string) => void
  approveItem: (id: string) => void
  rejectItem: (id: string) => void
  suspendSeller: (sellerId: string) => void
  verifySeller: (sellerId: string) => void
}

// Mock marketplace items
const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "Premium Dark Theme Collection",
    description:
      "A collection of 5 beautiful dark themes for Jellyfin with custom CSS animations and modern design elements.",
    price: 15.99,
    currency: "GBP",
    category: "themes",
    condition: "new",
    images: ["/placeholder.png", "/placeholder.png"],
    sellerId: "2",
    sellerName: "ThemeCreator",
    sellerRating: 4.8,
    sellerVerified: true,
    location: "London, UK",
    shipping: {
      available: false,
      cost: 0,
      methods: [],
    },
    tags: ["dark", "modern", "css", "responsive"],
    status: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    views: 234,
    favorites: 45,
    reports: 0,
    featured: true,
  },
  {
    id: "2",
    title: "Jellyfin Auto-Backup Plugin",
    description: "Automatically backup your Jellyfin configuration and metadata. Supports cloud storage integration.",
    price: 25.0,
    currency: "GBP",
    category: "plugins",
    condition: "new",
    images: ["/placeholder.png"],
    sellerId: "3",
    sellerName: "DevTools",
    sellerRating: 4.9,
    sellerVerified: true,
    location: "Manchester, UK",
    shipping: {
      available: false,
      cost: 0,
      methods: [],
    },
    tags: ["backup", "automation", "cloud", "metadata"],
    status: "active",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-12"),
    views: 189,
    favorites: 32,
    reports: 0,
    featured: false,
  },
  {
    id: "3",
    title: "Raspberry Pi 4 Media Server Kit",
    description: "Complete Raspberry Pi 4 setup with case, cooling, and pre-configured Jellyfin installation.",
    price: 89.99,
    currency: "GBP",
    category: "hardware",
    condition: "new",
    images: ["/placeholder.png", "/placeholder.png", "/placeholder.png"],
    sellerId: "4",
    sellerName: "TechBuilder",
    sellerRating: 4.7,
    sellerVerified: true,
    location: "Birmingham, UK",
    shipping: {
      available: true,
      cost: 5.99,
      methods: ["Standard Delivery", "Express Delivery"],
    },
    tags: ["raspberry-pi", "hardware", "complete-kit", "pre-configured"],
    status: "active",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    views: 456,
    favorites: 78,
    reports: 0,
    featured: true,
  },
  {
    id: "4",
    title: "Custom Jellyfin Configuration Service",
    description:
      "Professional setup and configuration of your Jellyfin server with optimization and security hardening.",
    price: 45.0,
    currency: "GBP",
    category: "services",
    condition: "new",
    images: ["/placeholder.png"],
    sellerId: "5",
    sellerName: "MediaExpert",
    sellerRating: 5.0,
    sellerVerified: true,
    location: "Edinburgh, UK",
    shipping: {
      available: false,
      cost: 0,
      methods: [],
    },
    tags: ["configuration", "setup", "optimization", "security"],
    status: "active",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    views: 123,
    favorites: 28,
    reports: 0,
    featured: false,
  },
  {
    id: "5",
    title: "Movie Collection Metadata Pack",
    description: "High-quality metadata, posters, and fanart for 1000+ popular movies. Professionally curated.",
    price: 12.5,
    currency: "GBP",
    category: "media",
    condition: "new",
    images: ["/placeholder.png", "/placeholder.png"],
    sellerId: "6",
    sellerName: "MetadataKing",
    sellerRating: 4.6,
    sellerVerified: false,
    location: "Cardiff, UK",
    shipping: {
      available: false,
      cost: 0,
      methods: [],
    },
    tags: ["metadata", "posters", "movies", "fanart"],
    status: "pending",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    views: 67,
    favorites: 15,
    reports: 1,
    featured: false,
  },
]

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      items: mockItems,
      filters: {},
      viewMode: "grid",
      sortBy: "newest",

      setItems: (items) => set({ items }),

      addItem: (itemData) => {
        const newItem: MarketplaceItem = {
          ...itemData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          views: 0,
          favorites: 0,
          reports: 0,
          sellerRating: 5.0,
          featured: false,
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item)),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      setFilters: (filters) => set({ filters }),

      setViewMode: (viewMode) => set({ viewMode }),

      setSortBy: (sortBy) => set({ sortBy }),

      getFilteredItems: () => {
        const { items, filters, sortBy } = get()
        let filtered = [...items]

        // Apply filters
        if (filters.category) {
          filtered = filtered.filter((item) => item.category === filters.category)
        }
        if (filters.minPrice !== undefined) {
          filtered = filtered.filter((item) => item.price >= filters.minPrice!)
        }
        if (filters.maxPrice !== undefined) {
          filtered = filtered.filter((item) => item.price <= filters.maxPrice!)
        }
        if (filters.condition) {
          filtered = filtered.filter((item) => item.condition === filters.condition)
        }
        if (filters.location) {
          filtered = filtered.filter((item) => item.location.toLowerCase().includes(filters.location!.toLowerCase()))
        }
        if (filters.verified) {
          filtered = filtered.filter((item) => item.sellerVerified)
        }
        if (filters.status) {
          filtered = filtered.filter((item) => item.status === filters.status)
        }
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          filtered = filtered.filter(
            (item) =>
              item.title.toLowerCase().includes(searchTerm) ||
              item.description.toLowerCase().includes(searchTerm) ||
              item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
          )
        }

        // Apply sorting
        switch (sortBy) {
          case "newest":
            filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            break
          case "oldest":
            filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            break
          case "price-low":
            filtered.sort((a, b) => a.price - b.price)
            break
          case "price-high":
            filtered.sort((a, b) => b.price - a.price)
            break
          case "popular":
            filtered.sort((a, b) => b.views + b.favorites - (a.views + a.favorites))
            break
        }

        return filtered
      },

      getUserItems: (userId) => {
        const { items } = get()
        return items.filter((item) => item.sellerId === userId)
      },

      getSellerStats: (sellerId) => {
        const { items } = get()
        const sellerItems = items.filter((item) => item.sellerId === sellerId)

        return {
          totalListings: sellerItems.length,
          activeListings: sellerItems.filter((item) => item.status === "active").length,
          soldItems: sellerItems.filter((item) => item.status === "sold").length,
          totalEarnings: sellerItems
            .filter((item) => item.status === "sold")
            .reduce((sum, item) => sum + item.price, 0),
          averageRating: sellerItems.length > 0 ? sellerItems[0].sellerRating : 0,
          totalViews: sellerItems.reduce((sum, item) => sum + item.views, 0),
          totalFavorites: sellerItems.reduce((sum, item) => sum + item.favorites, 0),
        }
      },

      reportItem: (id) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, reports: item.reports + 1 } : item)),
        }))
      },

      favoriteItem: (id) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, favorites: item.favorites + 1 } : item)),
        }))
      },

      incrementViews: (id) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, views: item.views + 1 } : item)),
        }))
      },

      approveItem: (id) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, status: "active" as const } : item)),
        }))
      },

      rejectItem: (id) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, status: "rejected" as const } : item)),
        }))
      },

      suspendSeller: (sellerId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.sellerId === sellerId ? { ...item, status: "rejected" as const } : item,
          ),
        }))
      },

      verifySeller: (sellerId) => {
        set((state) => ({
          items: state.items.map((item) => (item.sellerId === sellerId ? { ...item, sellerVerified: true } : item)),
        }))
      },
    }),
    {
      name: "marketplace-store",
    },
  ),
)
