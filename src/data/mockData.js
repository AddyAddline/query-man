// Sample predefined queries with their mock results
export const predefinedQueries = [
  {
    id: "q1",
    name: "All Users",
    description:
      "Retrieve all users from the database with their basic information",
    query: "SELECT * FROM users;",
    executionTime: "0.023s",
  },
  {
    id: "q2",
    name: "Top Products by Revenue",
    description: "Find the top 10 products by total revenue",
    query:
      "SELECT p.product_name, p.category, SUM(o.quantity * p.price) as revenue\nFROM orders o\nJOIN products p ON o.product_id = p.id\nGROUP BY p.product_name, p.category\nORDER BY revenue DESC\nLIMIT 10;",
    executionTime: "0.047s",
  },
  {
    id: "q3",
    name: "Customer Order Analysis",
    description:
      "Analyze customer purchasing patterns by order count and total spent",
    query:
      "SELECT c.customer_id, c.name, c.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name, c.email\nORDER BY total_spent DESC;",
    executionTime: "0.061s",
  },
  {
    id: "q4",
    name: "Product Inventory Status",
    description: "Check current inventory levels for all products",
    query:
      "SELECT p.product_id, p.product_name, p.category, i.quantity_in_stock,\nCASE\n  WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'\n  WHEN i.quantity_in_stock < 10 THEN 'Low Stock'\n  ELSE 'In Stock'\nEND as stock_status\nFROM products p\nJOIN inventory i ON p.product_id = i.product_id\nORDER BY i.quantity_in_stock ASC;",
    executionTime: "0.039s",
  },
  {
    id: "q5",
    name: "Monthly Sales Trends",
    description: "Analyze sales trends by month for the current year",
    query:
      "SELECT\n  EXTRACT(MONTH FROM order_date) as month,\n  COUNT(*) as order_count,\n  SUM(total_amount) as monthly_revenue\nFROM orders\nWHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)\nGROUP BY EXTRACT(MONTH FROM order_date)\nORDER BY month;",
    executionTime: "0.058s",
  },
];

// Mock data for query results
export const mockResults = {
  q1: [
    {
      id: 1,
      username: "johndoe",
      name: "John Doe",
      email: "john@example.com",
      registration_date: "2023-01-15",
      is_active: true,
    },
    {
      id: 2,
      username: "janedoe",
      name: "Jane Doe",
      email: "jane@example.com",
      registration_date: "2023-02-20",
      is_active: true,
    },
    {
      id: 3,
      username: "mike123",
      name: "Mike Johnson",
      email: "mike@example.com",
      registration_date: "2023-03-10",
      is_active: false,
    },
    {
      id: 4,
      username: "sarasmith",
      name: "Sara Smith",
      email: "sara@example.com",
      registration_date: "2023-03-15",
      is_active: true,
    },
    {
      id: 5,
      username: "robert42",
      name: "Robert Brown",
      email: "robert@example.com",
      registration_date: "2023-04-01",
      is_active: true,
    },
    {
      id: 6,
      username: "emily88",
      name: "Emily Wilson",
      email: "emily@example.com",
      registration_date: "2023-04-12",
      is_active: true,
    },
    {
      id: 7,
      username: "davidl",
      name: "David Lee",
      email: "david@example.com",
      registration_date: "2023-04-20",
      is_active: false,
    },
    {
      id: 8,
      username: "amandaj",
      name: "Amanda Jones",
      email: "amanda@example.com",
      registration_date: "2023-05-05",
      is_active: true,
    },
    {
      id: 9,
      username: "alex99",
      name: "Alex Taylor",
      email: "alex@example.com",
      registration_date: "2023-05-18",
      is_active: true,
    },
    {
      id: 10,
      username: "chris77",
      name: "Chris Martin",
      email: "chris@example.com",
      registration_date: "2023-06-02",
      is_active: true,
    },
    {
      id: 11,
      username: "oliviah",
      name: "Olivia Harris",
      email: "olivia@example.com",
      registration_date: "2023-06-15",
      is_active: true,
    },
    {
      id: 12,
      username: "danw",
      name: "Daniel White",
      email: "daniel@example.com",
      registration_date: "2023-07-01",
      is_active: false,
    },
    {
      id: 13,
      username: "sophiag",
      name: "Sophia Garcia",
      email: "sophia@example.com",
      registration_date: "2023-07-12",
      is_active: true,
    },
    {
      id: 14,
      username: "liam42",
      name: "Liam Jackson",
      email: "liam@example.com",
      registration_date: "2023-07-25",
      is_active: true,
    },
    {
      id: 15,
      username: "emmas",
      name: "Emma Scott",
      email: "emma@example.com",
      registration_date: "2023-08-05",
      is_active: true,
    },
  ],
  q2: [
    {
      product_name: 'MacBook Pro 16"',
      category: "Electronics",
      revenue: 145820.0,
    },
    {
      product_name: "iPhone 14 Pro",
      category: "Electronics",
      revenue: 98450.0,
    },
    {
      product_name: "Samsung 4K Smart TV",
      category: "Electronics",
      revenue: 87320.0,
    },
    {
      product_name: "Dyson V11 Vacuum",
      category: "Home Appliances",
      revenue: 56430.0,
    },
    {
      product_name: "Nike Air Max 270",
      category: "Footwear",
      revenue: 42760.0,
    },
    {
      product_name: "PlayStation 5",
      category: "Electronics",
      revenue: 38950.0,
    },
    {
      product_name: "Bose QuietComfort Earbuds",
      category: "Electronics",
      revenue: 32580.0,
    },
    {
      product_name: "KitchenAid Stand Mixer",
      category: "Home Appliances",
      revenue: 29340.0,
    },
    {
      product_name: "Canon EOS R5 Camera",
      category: "Electronics",
      revenue: 26780.0,
    },
    {
      product_name: "Levi's 501 Original Jeans",
      category: "Clothing",
      revenue: 23450.0,
    },
  ],
  q3: [
    {
      customer_id: 5421,
      name: "Jennifer Thompson",
      email: "jennifer@company.com",
      order_count: 12,
      total_spent: 15782.45,
    },
    {
      customer_id: 8754,
      name: "Michael Reynolds",
      email: "michael@corporation.com",
      order_count: 8,
      total_spent: 12453.9,
    },
    {
      customer_id: 2387,
      name: "Sarah Williams",
      email: "sarah@organization.net",
      order_count: 10,
      total_spent: 9876.3,
    },
    {
      customer_id: 6542,
      name: "Robert Johnson",
      email: "robert@enterprise.org",
      order_count: 7,
      total_spent: 8765.25,
    },
    {
      customer_id: 1298,
      name: "Elizabeth Davis",
      email: "elizabeth@business.com",
      order_count: 9,
      total_spent: 7654.18,
    },
    {
      customer_id: 3571,
      name: "Thomas Anderson",
      email: "thomas@company.net",
      order_count: 6,
      total_spent: 6543.75,
    },
    {
      customer_id: 9812,
      name: "Patricia Martinez",
      email: "patricia@corporation.org",
      order_count: 5,
      total_spent: 5432.6,
    },
    {
      customer_id: 4623,
      name: "Christopher Wilson",
      email: "chris@enterprise.com",
      order_count: 4,
      total_spent: 4321.55,
    },
    {
      customer_id: 7156,
      name: "Jessica Thompson",
      email: "jessica@business.net",
      order_count: 3,
      total_spent: 3210.4,
    },
    {
      customer_id: 5289,
      name: "Daniel Brown",
      email: "daniel@organization.com",
      order_count: 2,
      total_spent: 2109.3,
    },
  ],
  q4: [
    {
      product_id: "P1023",
      product_name: "Wireless Headphones",
      category: "Electronics",
      quantity_in_stock: 0,
      stock_status: "Out of Stock",
    },
    {
      product_id: "P2145",
      product_name: "Smart Watch",
      category: "Electronics",
      quantity_in_stock: 3,
      stock_status: "Low Stock",
    },
    {
      product_id: "P3762",
      product_name: "Running Shoes",
      category: "Footwear",
      quantity_in_stock: 5,
      stock_status: "Low Stock",
    },
    {
      product_id: "P4287",
      product_name: "Coffee Maker",
      category: "Home Appliances",
      quantity_in_stock: 8,
      stock_status: "Low Stock",
    },
    {
      product_id: "P5934",
      product_name: "Bluetooth Speaker",
      category: "Electronics",
      quantity_in_stock: 12,
      stock_status: "In Stock",
    },
    {
      product_id: "P6417",
      product_name: "Laptop Bag",
      category: "Accessories",
      quantity_in_stock: 18,
      stock_status: "In Stock",
    },
    {
      product_id: "P7825",
      product_name: "Yoga Mat",
      category: "Fitness",
      quantity_in_stock: 24,
      stock_status: "In Stock",
    },
    {
      product_id: "P8369",
      product_name: "Desk Lamp",
      category: "Home Decor",
      quantity_in_stock: 31,
      stock_status: "In Stock",
    },
    {
      product_id: "P9541",
      product_name: "Water Bottle",
      category: "Drinkware",
      quantity_in_stock: 42,
      stock_status: "In Stock",
    },
    {
      product_id: "P1078",
      product_name: "Backpack",
      category: "Accessories",
      quantity_in_stock: 56,
      stock_status: "In Stock",
    },
    {
      product_id: "P2196",
      product_name: "Portable Charger",
      category: "Electronics",
      quantity_in_stock: 67,
      stock_status: "In Stock",
    },
    {
      product_id: "P3382",
      product_name: "Digital Camera",
      category: "Electronics",
      quantity_in_stock: 78,
      stock_status: "In Stock",
    },
  ],
  q5: [
    { month: 1, order_count: 320, monthly_revenue: 42560.75 },
    { month: 2, order_count: 345, monthly_revenue: 48720.5 },
    { month: 3, order_count: 380, monthly_revenue: 52840.25 },
    { month: 4, order_count: 410, monthly_revenue: 58950.3 },
    { month: 5, order_count: 390, monthly_revenue: 54320.15 },
    { month: 6, order_count: 430, monthly_revenue: 63450.8 },
    { month: 7, order_count: 460, monthly_revenue: 68540.95 },
    { month: 8, order_count: 440, monthly_revenue: 65230.4 },
    { month: 9, order_count: 420, monthly_revenue: 59870.6 },
    { month: 10, order_count: 405, monthly_revenue: 57650.25 },
    { month: 11, order_count: 450, monthly_revenue: 64780.5 },
    { month: 12, order_count: 490, monthly_revenue: 72340.85 },
  ],
};

// Generate a large dataset for performance testing
export const generateLargeDataset = (rowCount = 1000) => {
  const result = [];
  const categories = [
    "Electronics",
    "Clothing",
    "Footwear",
    "Home Goods",
    "Appliances",
    "Food",
    "Beverages",
  ];
  const statusOptions = [
    "Completed",
    "Processing",
    "Shipped",
    "Cancelled",
    "Returned",
  ];

  for (let i = 1; i <= rowCount; i++) {
    result.push({
      order_id: i,
      customer_name: `Customer ${i}`,
      product_name: `Product ${Math.floor(Math.random() * 500) + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
      quantity: Math.floor(Math.random() * 10) + 1,
      total: parseFloat((Math.random() * 5000 + 50).toFixed(2)),
      order_date: new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split("T")[0],
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    });
  }

  return result;
};

// Adding the large dataset to our mock results
mockResults.q6 = generateLargeDataset(1000);

// Add another predefined query for the large dataset
predefinedQueries.push({
  id: "q6",
  name: "All Orders (Large Dataset)",
  description: "Performance test with a large dataset of 1000 orders",
  query:
    "SELECT * FROM orders\nJOIN customers ON orders.customer_id = customers.id\nJOIN products ON orders.product_id = products.id;",
  executionTime: "0.214s",
});

// Generate an extra large dataset for virtualization testing (10,000 rows)
export const generateExtraLargeDataset = (rowCount = 10000) => {
  const result = [];
  const products = [
    "Laptop",
    "Smartphone",
    "Tablet",
    "Headphones",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Printer",
    "Speaker",
    "Camera",
  ];
  const companies = [
    "Apple",
    "Samsung",
    "Microsoft",
    "Google",
    "Dell",
    "HP",
    "Lenovo",
    "Sony",
    "LG",
    "Asus",
  ];
  const regions = ["North", "South", "East", "West", "Central"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const years = [2020, 2021, 2022, 2023];

  for (let i = 1; i <= rowCount; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const month = months[Math.floor(Math.random() * months.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const unitPrice = parseFloat((Math.random() * 1000 + 50).toFixed(2));

    result.push({
      id: i,
      product: `${company} ${product}`,
      region: region,
      date: `${month} ${year}`,
      quantity: quantity,
      unit_price: unitPrice,
      total_amount: parseFloat((quantity * unitPrice).toFixed(2)),
      is_priority: Math.random() > 0.7,
      status:
        Math.random() > 0.2
          ? "Completed"
          : Math.random() > 0.5
          ? "In Progress"
          : "Cancelled",
    });
  }

  return result;
};

// Add the extra large dataset to our mock results
mockResults.q7 = generateExtraLargeDataset(10000);

// Add another predefined query for the extra large dataset
predefinedQueries.push({
  id: "q7",
  name: "All Sales (Virtualized 10K Rows)",
  description:
    "Performance demonstration with 10,000 rows using virtualized rendering",
  query:
    "SELECT * FROM sales JOIN products ON sales.product_id = products.id ORDER BY date DESC;",
  executionTime: "0.456s",
});
