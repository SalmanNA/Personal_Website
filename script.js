document.addEventListener('DOMContentLoaded', () => {
    const bookList = document.getElementById('bookList');
    const searchInput = document.getElementById('searchInput');
    const memberList = document.getElementById('memberList');
    const memberSearchInput = document.getElementById('memberSearchInput');
    const loanList = document.getElementById('loanList');
    const loanSearchInput = document.getElementById('loanSearchInput');

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    async function fetchData(url) {
        const response = await fetch(url);
        return response.json();
    }

    function formatDateString(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function displayBooks(books) {
        bookList.innerHTML = '';
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'item';
            bookItem.innerHTML = `
                <h3>${book.Title}</h3>
                <p>by ${book.Author}</p>
                <p>Genre: ${book.Genre}</p>
                <p>${formatDateString(book.PublishedYear)}</p>
            `;
            bookList.appendChild(bookItem);
        });
    }

    function displayMembers(members) {
        memberList.innerHTML = '';
        members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'item';
            memberItem.innerHTML = `
                <h3>${member.Name}</h3>
                <p>Member ID: ${member.MemberID}</p>
                <p>Email: ${member.Email}</p>
                <p>Joined: ${formatDateString(member.MembershipDate)}</p>
            `;
            memberList.appendChild(memberItem);
        });
    }

    function displayLoans(loans) {
        loanList.innerHTML = '';
        loans.forEach(loan => {
            const loanItem = document.createElement('div');
            loanItem.className = 'item';
            loanItem.innerHTML = `
                <h3>Member: ${loan.MemberName}</h3>
                <p>Loan ID: ${loan.LoanID}</p>
                <p>Book: ${loan.BookTitle}</p>
                <p>Loan Date: ${formatDateString(loan.LoanDate)}</p>
                <p>Return Date: ${formatDateString(loan.ReturnDate)}</p>
            `;
            loanList.appendChild(loanItem);
        });
    }

    function filterItems(items, searchText, keys) {
        searchText = searchText.toLowerCase();
        return items.filter(item => 
            keys.some(key => item[key].toString().toLowerCase().includes(searchText))
        );
    }

    function filterBooks() {
        const searchText = searchInput.value.toLowerCase();
        fetchData('http://131.94.132.8:3000/books').then(books => {
            const filteredBooks = filterItems(books, searchText, ['Title', 'Author', 'Genre']);
            displayBooks(filteredBooks);
        });
    }

    function filterMembers() {
        const searchText = memberSearchInput.value.toLowerCase();
        fetchData('https://131.94.132.8:3000/members').then(members => {
            const filteredMembers = filterItems(members, searchText, ['Name', 'Email']);
            displayMembers(filteredMembers);
        });
    }

    function filterLoans() {
        const searchText = loanSearchInput.value.toLowerCase();
        Promise.all([
            fetchData('https://131.94.132.8:3000/loans'),
            fetchData('https://131.94.132.8:3000/members'),
            fetchData('http://131.94.132.8:3000/books')
        ]).then(([loans, members, books]) => {
            const loansWithDetails = loans.map(loan => {
                const member = members.find(member => member.MemberID === loan.MemberID);
                const book = books.find(book => book.BookID === loan.BookID);
                return { 
                    ...loan, 
                    MemberName: member ? member.Name : 'Unknown', 
                    BookTitle: book ? book.Title : 'Unknown' 
                };
            });
            const filteredLoans = filterItems(loansWithDetails, searchText, ['MemberID', 'BookID', 'MemberName', 'BookTitle']);
            displayLoans(filteredLoans);
        });
    }

    searchInput.addEventListener('input', filterBooks);
    memberSearchInput.addEventListener('input', filterMembers);
    loanSearchInput.addEventListener('input', filterLoans);

    // Initial load
    filterBooks();
    filterMembers();
    filterLoans();
});
