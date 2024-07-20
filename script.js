document.addEventListener('DOMContentLoaded', () => {
    const bookList = document.getElementById('bookList');
    const searchInput = document.getElementById('searchInput');
    const memberList = document.getElementById('memberList');
    const memberSearchInput = document.getElementById('memberSearchInput');
    const loanList = document.getElementById('loanList');
    const loanSearchInput = document.getElementById('loanSearchInput');

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
            bookItem.className = 'book-item';
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
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <h3>${member.Name}</h3>
                <p>Member ID: ${member.MemberID}</p>
                <p>Member Name: ${member.Name}</p>
                <p>Member Email: ${member.Email}</p>
                <p>Membership Date: ${formatDateString(member.MembershipDate)}</p>
            `;
            memberList.appendChild(memberItem);
        });
    }

    function displayLoans(loans) {
        loanList.innerHTML = '';
        loans.forEach(loan => {
            const loanItem = document.createElement('div');
            loanItem.className = 'loan-item';
            loanItem.innerHTML = `
                <h3>Book: ${loan.BookTitle}</h3>
                <p>Member: ${loan.MemberName}</p>
                <p>Loan ID: ${loan.LoanID}</p>
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
        fetchData('https://librarydbserver.fly.dev/books').then(books => {
            const filteredBooks = filterItems(books, searchText, ['Title', 'Author', 'Genre']);
            displayBooks(filteredBooks);
        });
    }

    function filterMembers() {
        const searchText = memberSearchInput.value.toLowerCase();
        fetchData('https://librarydbserver.fly.dev/members').then(members => {
            const filteredMembers = filterItems(members, searchText, ['Name', 'MemberID', 'Email']);
            displayMembers(filteredMembers);
        });
    }

    function filterLoans() {
        const searchText = loanSearchInput.value.toLowerCase();
        Promise.all([
            fetchData('https://librarydbserver.fly.dev/loans'),
            fetchData('https://librarydbserver.fly.dev/members'),
            fetchData('https://librarydbserver.fly.dev/books')
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
