import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/botadi";

async function seed() {
  console.log("🌱 Seeding Botadi Studio database...");
  console.log(`📡 Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db!;

  // Check if admin already exists
  const usersCollection = db.collection("users");
  const existingAdmin = await usersCollection.findOne({ email: "admin@botadi.com" });

  if (existingAdmin) {
    console.log("⚠️  Admin user already exists. Skipping seed.");
    await mongoose.disconnect();
    return;
  }

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminResult = await usersCollection.insertOne({
    name: "Admin",
    email: "admin@botadi.com",
    passwordHash,
    role: "admin",
    studioName: "Botadi Studio",
    phone: "",
    address: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const adminId = adminResult.insertedId;
  console.log("✅ Admin user created (admin@botadi.com / admin123)");

  // Create default service types
  const servicesCollection = db.collection("servicetypes");
  const defaultServices = [
    { name: "Camera (Photography)", rate: 15000, rateUnit: "per_event", description: "Professional photography coverage", isActive: true },
    { name: "Cinematography", rate: 20000, rateUnit: "per_event", description: "Cinematic video coverage", isActive: true },
    { name: "Videography", rate: 12000, rateUnit: "per_event", description: "Standard video coverage", isActive: true },
    { name: "Drone", rate: 8000, rateUnit: "per_event", description: "Aerial drone photography and video", isActive: true },
    { name: "Photo Editing", rate: 5000, rateUnit: "per_event", description: "Professional photo editing and retouching", isActive: true },
    { name: "Video Editing", rate: 10000, rateUnit: "per_event", description: "Video post-production and editing", isActive: true },
    { name: "Album", rate: 8000, rateUnit: "per_event", description: "Premium photo album", isActive: true },
  ];

  await servicesCollection.insertMany(
    defaultServices.map((s) => ({
      ...s,
      userId: adminId,
      createdAt: new Date(),
    }))
  );
  console.log("✅ Default service types created (7 services)");

  // Create sample staff
  const staffCollection = db.collection("staffs");
  const sampleStaff = [
    { name: "Rahul Sharma", phone: "9876543210", role: "photographer", specialization: "Wedding Photography", isActive: true },
    { name: "Priya Patel", phone: "9876543211", role: "cinematographer", specialization: "Cinematic Films", isActive: true },
    { name: "Amit Kumar", phone: "9876543212", role: "videographer", specialization: "Event Coverage", isActive: true },
    { name: "Vikram Singh", phone: "9876543213", role: "drone_operator", specialization: "Aerial Photography", isActive: true },
    { name: "Sneha Desai", phone: "9876543214", role: "editor", specialization: "Photo & Video Editing", isActive: true },
  ];

  await staffCollection.insertMany(
    sampleStaff.map((s) => ({
      ...s,
      userId: adminId,
      email: "",
      createdAt: new Date(),
    }))
  );
  console.log("✅ Sample staff members created (5 members)");

  console.log("\n🎉 Seed complete!");
  console.log("📧 Login: admin@botadi.com");
  console.log("🔑 Password: admin123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
