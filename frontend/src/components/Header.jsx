import '../index.css';

const Header = () => {
    return (
        <header className="home-header">
            <div className="flex-between">
                <div>
                    <h1>
                        Hi, Jaume L.
                    </h1>
                </div>

                <div className="header-avatar">
                    {/* use specific image if available, else placeholder icon */}
                    {/* <img src="..." alt="Profile" /> */}
                </div>
            </div>
        </header>
    );
};

export default Header;
