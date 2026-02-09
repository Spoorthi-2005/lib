// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Library {
    enum Role { None, Student, Faculty, Librarian }

    struct User {
        string username;
        string email;
        Role role;
        uint256 gradOrLeaveDate; // Unix timestamp
        uint256 joinedDate;      // New: Joined Date
        bool isActive;
        uint256 fine;
        uint256[] issuedBooks;
        string rollNumber; // For students
        string facultyId; // For faculty
        string libraryId; // For librarians
    }

    struct Book {
        uint256 id;
        string title;
        string author;
        string isbn;
        string image;
        string domain;
        uint256 totalCopies;
        uint256 availableCopies;
    }

    struct Issue {
        uint256 bookId;
        address user;
        uint256 issueDate;
        uint256 dueDate;
        bool returned;
        uint256 returnDate;
        uint256 finePaid;
    }

    mapping(address => User) public users;
    mapping(uint256 => Book) public books;
    mapping(address => mapping(uint256 => Issue)) public issues; // user => bookId => Issue
    mapping(address => uint256[]) public userIssuedBooks;
    uint256 public bookCount;

    event BookIssued(string username, uint256 bookId, uint256 timestamp, uint256 dueDate);
    event BookReturned(string username, uint256 bookId, uint256 timestamp, uint256 fine);
    event BookAdded(uint256 bookId, string title, uint256 copies);
    event FinePaid(string username, uint256 bookId, uint256 amount, uint256 timestamp);

    // Add a simple constructor to fix deployment issues
    constructor() {
        bookCount = 1; // Start IDs at 1 to match SQLite
    }

    modifier onlyActiveUser() {
        require(users[msg.sender].isActive, "User not active");
        // Removed graduation date check to allow access even after graduation
        // This is more practical for real-world scenarios
        _;
    }

    function registerUser(string memory _username, string memory _email, uint8 _role, uint256 _gradOrLeaveDate, string memory _rollNumber, string memory _facultyId, string memory _libraryId) public {
        require(users[msg.sender].role == Role.None, "Already registered");
        // Removed graduation date validation to allow more flexibility
        users[msg.sender] = User(_username, _email, Role(_role), _gradOrLeaveDate, block.timestamp, true, 0, new uint256[](0), _rollNumber, _facultyId, _libraryId);
    }

    function addBook(string memory _title, string memory _author, string memory _isbn, string memory _image, string memory _domain, uint256 _copies) public {
        require(users[msg.sender].role == Role.Librarian, "Only librarian");
        books[bookCount] = Book(bookCount, _title, _author, _isbn, _image, _domain, _copies, _copies);
        emit BookAdded(bookCount, _title, _copies);
        bookCount++;
    }

    function updateBook(uint256 _bookId, string memory _title, string memory _author, string memory _isbn, string memory _image, string memory _domain, uint256 _copies) public {
        require(users[msg.sender].role == Role.Librarian, "Only librarian");
        Book storage book = books[_bookId];
        book.title = _title;
        book.author = _author;
        book.isbn = _isbn;
        book.image = _image;
        book.domain = _domain;
        book.totalCopies = _copies;
        book.availableCopies = _copies;
    }

    function removeBook(uint256 _bookId) public {
        require(users[msg.sender].role == Role.Librarian, "Only librarian");
        delete books[_bookId];
    }

    function borrowBook(uint256 _bookId) public onlyActiveUser {
        User storage user = users[msg.sender];
        Book storage book = books[_bookId];
        
        // Lazy initialization: if book doesn't exist on-chain, initialize it with default 5 copies
        if (book.totalCopies == 0) {
            book.id = _bookId;
            book.title = "Auto-Synced Book"; // Placeholder, real title in DB/Receipt
            book.totalCopies = 5;
            book.availableCopies = 5;
        }

        require(book.availableCopies > 0, "No copies available");
        
        // Fix: Allow re-borrowing if previous issue was returned
        Issue storage existingIssue = issues[msg.sender][_bookId];
        require(existingIssue.issueDate == 0 || existingIssue.returned, "Book already issued and not returned");

        uint256 maxBooks = user.role == Role.Student ? 3 : (user.role == Role.Faculty ? 5 : 0);
        
        // Filter out returned books from the count
        uint256 activeIssuesCount = 0;
        for(uint i = 0; i < user.issuedBooks.length; i++) {
             if(!issues[msg.sender][user.issuedBooks[i]].returned) {
                 activeIssuesCount++;
             }
        }
        require(activeIssuesCount < maxBooks, "Borrow limit reached");

        uint256 dueDays = user.role == Role.Student ? 14 : 30;
        uint256 dueDate = block.timestamp + dueDays * 1 days;

        Issue memory newIssue = Issue(_bookId, msg.sender, block.timestamp, dueDate, false, 0, 0);
        issues[msg.sender][_bookId] = newIssue;
        
        // Add to issuedBooks list if not already there (or re-add if we want to track history, but struct is single-entry per user-book pair in this simple design)
        // correct logic: if it's a re-borrow, we just update the mapping. 
        // We also need to update user.issuedBooks. Ideally detailed history is stored off-chain or in events.
        // For on-chain simplicity, we'll just track active issues in `issuedBooks` or handle duplicates.
        
        bool alreadyInList = false;
        for(uint i=0; i<user.issuedBooks.length; i++){
            if(user.issuedBooks[i] == _bookId){
                alreadyInList = true;
                break;
            }
        }
        if(!alreadyInList) {
             user.issuedBooks.push(_bookId);
             userIssuedBooks[msg.sender].push(_bookId);
        }

        book.availableCopies--;

        emit BookIssued(user.username, _bookId, block.timestamp, dueDate);
    }

    function returnBook(uint256 _bookId) public onlyActiveUser {
        Issue storage issue = issues[msg.sender][_bookId];
        require(issue.issueDate != 0 && !issue.returned, "Not issued or already returned");
        User storage user = users[msg.sender];
        Book storage book = books[_bookId];

        uint256 fine = calculateFine(msg.sender, _bookId);
        issue.returned = true;
        issue.returnDate = block.timestamp;
        issue.finePaid = fine;
        user.fine += fine;
        book.availableCopies++;

        // Remove from issuedBooks
        for (uint i = 0; i < user.issuedBooks.length; i++) {
            if (user.issuedBooks[i] == _bookId) {
                user.issuedBooks[i] = user.issuedBooks[user.issuedBooks.length - 1];
                user.issuedBooks.pop();
                break;
            }
        }

        emit BookReturned(user.username, _bookId, block.timestamp, fine);
    }

    function calculateFine(address _user, uint256 _bookId) public view returns (uint256) {
        Issue storage issue = issues[_user][_bookId];
        User storage user = users[_user];
        if (issue.returned || issue.issueDate == 0) return 0;
        uint256 lateDays = 0;
        uint256 finePerDay = user.role == Role.Student ? 10 : 10; // ₹10 per day for both
        uint256 dueDate = issue.dueDate;
        if (block.timestamp > dueDate) {
            lateDays = (block.timestamp - dueDate) / 1 days;
        }
        return lateDays * finePerDay;
    }

    function getBooks() public view returns (Book[] memory) {
        Book[] memory allBooks = new Book[](bookCount);
        for (uint i = 0; i < bookCount; i++) {
            allBooks[i] = books[i];
        }
        return allBooks;
    }

    function getUserIssuedBooks(address _user) public view returns (Issue[] memory) {
        uint256[] storage ids = userIssuedBooks[_user];
        Issue[] memory result = new Issue[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = issues[_user][ids[i]];
        }
        return result;
    }
} 