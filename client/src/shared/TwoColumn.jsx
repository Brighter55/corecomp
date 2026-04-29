function TwoColumn({ children }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            {children}
        </div>
    );
}

export default TwoColumn
