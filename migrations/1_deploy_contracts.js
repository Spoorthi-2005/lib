const Library = artifacts.require("Library");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Library);
  const library = await Library.deployed();

  console.log("Seeding initial books to Blockchain...");
  // Note: Only the deployer (Librarian) can add books. Check role assignment in constructor or if 'addBook' allows owner.
  // Wait, my contract 'addBook' requires 'Librarian' role.
  // But the deployer account does not have a role initially!
  // I must register the deployer as Librarian first.

  // Register Deployer as Librarian
  // Role Enum: None=0, Student=1, Faculty=2, Librarian=3
  // registerUser(username, email, role, gradDate, rollNo, facultyId, libId)
  try {
    const farFuture = Math.floor(Date.now() / 1000) + (365 * 50 * 24 * 60 * 60); // 50 years from now
    await library.registerUser("Librarian", "admin@library.com", 3, farFuture, "", "", "LIB001", { from: accounts[0] });
    console.log("Registered Deployer as Librarian");
  } catch (e) {
    console.log("Librarian seeded or error: " + e.message);
  }

  console.log("Seeding 50 books to Blockchain (this may take a while)...");

  const domains = ['Fiction', 'Technology', 'Science', 'History', 'Philosophy'];
  const images = [
    'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    'https://covers.openlibrary.org/b/id/8394982-L.jpg',
    'https://images-na.ssl-images-amazon.com/images/I/41jEbK-jG+L._SX374_BO1,204,203,200_.jpg',
    'https://covers.openlibrary.org/b/id/8225261-L.jpg',
    'https://covers.openlibrary.org/b/id/8254332-L.jpg'
  ];

  for (let i = 1; i <= 50; i++) {
    const isb = `ISBN${1000 + i}`;
    const domain = domains[i % 5];
    const image = images[i % 5];

    // addBook(title, author, isbn, image, domain, copies)
    await library.addBook(`Book Title ${i}`, `Author ${i}`, isb, image, domain, 5, { from: accounts[0] });
    if (i % 10 === 0) console.log(`Added ${i} books...`);
  }
}; 