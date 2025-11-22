export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  allergens?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'appetizers',
    name: 'Appetizers',
    icon: '🥗',
    items: [
      {
        id: 'caesar-salad',
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing',
        price: 12.99,
        category: 'appetizers',
        isVegetarian: true,
        allergens: ['dairy', 'gluten'],
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'buffalo-wings',
        name: 'Buffalo Wings',
        description: 'Crispy chicken wings tossed in spicy buffalo sauce, served with celery and blue cheese dip',
        price: 14.99,
        category: 'appetizers',
        allergens: ['dairy'],
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'calamari',
        name: 'Fried Calamari',
        description: 'Golden fried squid rings served with marinara sauce and lemon wedges',
        price: 16.99,
        category: 'appetizers',
        image: 'https://images.unsplash.com/photo-1603079842519-3ed498c548c3?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'mains',
    name: 'Main Courses',
    icon: '🍽️',
    items: [
      {
        id: 'grilled-salmon',
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon grilled to perfection, served with roasted vegetables and quinoa',
        price: 24.99,
        category: 'mains',
        isGlutenFree: true,
        image: 'https://images.unsplash.com/photo-1612874470907-97b5c6f9b9bb?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'ribeye-steak',
        name: 'Ribeye Steak',
        description: '12oz prime ribeye steak cooked to your liking, served with mashed potatoes and asparagus',
        price: 32.99,
        category: 'mains',
        image: 'https://images.unsplash.com/photo-1604908177522-4023ac76c8a7?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'chicken-parmesan',
        name: 'Chicken Parmesan',
        description: 'Breaded chicken breast topped with marinara sauce and mozzarella, served with spaghetti',
        price: 22.99,
        category: 'mains',
        allergens: ['gluten', 'dairy'],
        image: 'https://images.unsplash.com/photo-1604908176983-4e4a82d90fcb?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'vegetarian-pasta',
        name: 'Mushroom Risotto',
        description: 'Creamy Arborio rice with wild mushrooms, parmesan, and fresh herbs',
        price: 19.99,
        category: 'mains',
        isVegetarian: true,
        allergens: ['dairy'],
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: '🍰',
    items: [
      {
        id: 'chocolate-lava-cake',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
        price: 8.99,
        category: 'desserts',
        isVegetarian: true,
        allergens: ['dairy', 'gluten', 'eggs'],
        image: 'https://images.unsplash.com/photo-1601925260489-6234d3ce42c5?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'tiramisu',
        name: 'Classic Tiramisu',
        description: 'Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
        price: 7.99,
        category: 'desserts',
        isVegetarian: true,
        allergens: ['dairy', 'gluten', 'eggs'],
        image: 'https://images.unsplash.com/photo-1601972599720-bc87b0c8e6cf?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'fruit-tart',
        name: 'Seasonal Fruit Tart',
        description: 'Fresh seasonal fruits on a buttery pastry crust with custard filling',
        price: 6.99,
        category: 'desserts',
        isVegetarian: true,
        allergens: ['dairy', 'gluten', 'eggs'],
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    items: [
      {
        id: 'craft-beer',
        name: 'Local Craft Beer',
        description: 'Selection of local craft beers on tap',
        price: 6.99,
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'house-wine',
        name: 'House Wine',
        description: 'Red or white house wine by the glass',
        price: 8.99,
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'signature-cocktail',
        name: 'Signature Cocktail',
        description: 'Our bartender\'s special creation with premium spirits',
        price: 12.99,
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1546171753-97d7676e3e5c?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'fresh-juice',
        name: 'Fresh Squeezed Juice',
        description: 'Orange, apple, or mixed berry juice made fresh daily',
        price: 4.99,
        category: 'beverages',
        isVegan: true,
        isGlutenFree: true,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const featuredItems: MenuItem[] = [
  menuCategories[1].items[0], // Grilled Salmon
  menuCategories[1].items[1], // Ribeye Steak
  menuCategories[2].items[0], // Chocolate Lava Cake
];

export const restaurantInfo = {
  name: 'Expense Manager',
  description: 'Personal expense tracker and budget manager',
  address: '',
  phone: '',
  hours: '',
  rating: 0,
  reviewCount: 0
};