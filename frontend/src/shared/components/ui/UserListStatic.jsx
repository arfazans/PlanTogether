const UserListStatic = () => {
    return (
        <div className="flex flex-col h-full bg-transparent text-gray-100">
        {/* Header */}
        <div className="block px-4 py-2 font-medium text-center bg-transparent rounded-t-lg">
            Users
        </div>

        {/* Scrollable users container */}
     <div className="flex-1 overflow-y-auto divide-y divide-gray-600 bg-neutral-700">
            {/* User item 1 */}
            <div className="flex px-4 py-3">
            <div className="shrink-0 relative">
                <img
                className="rounded-full w-11 h-11"
                src="/docs/images/people/profile-picture-1.jpg"
                alt="Jese"
                />
                <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-600 border border-white rounded-full dark:border-gray-800">
                <svg
                    className="w-2 h-2 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                >
                    <path d="M1 18h16a1 1 0 0 0 1-1v-6h-4.439a.99.99 0 0 0-.908.6 3.978 3.978 0 0 1-7.306 0 .99.99 0 0 0-.908-.6H0v6a1 1 0 0 0 1 1Z" />
                    <path d="M4.439 9a2.99 2.99 0 0 1 2.742 1.8 1.977 1.977 0 0 0 3.638 0A2.99 2.99 0 0 1 13.561 9H17.8L15.977.783A1 1 0 0 0 15 0H3a1 1 0 0 0-.977.783L.2 9h4.239Z" />
                </svg>
                </div>
            </div>
            <div className="w-full ps-3">
                <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                New message from{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    Jese Leos
                </span>
                : "Hey, what's up? All set for the presentation?"
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                a few moments ago
                </div>
            </div>
            </div>

            {/* User item 2 */}
            <div className="flex px-4 py-3">
            <div className="shrink-0 relative">
                <img
                className="rounded-full w-11 h-11"
                src="/docs/images/people/profile-picture-2.jpg"
                alt="Joseph"
                />
                <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-gray-900 border border-white rounded-full dark:border-gray-800">
                <svg
                    className="w-2 h-2 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                >
                    <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                </svg>
                </div>
            </div>
            <div className="w-full ps-3">
                <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                    Joseph Mcfall
                </span>{" "}
                and{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                    5 others
                </span>{" "}
                started following you.
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                10 minutes ago
                </div>
            </div>
            </div>

            {/* User item 3 */}
            <div className="flex px-4 py-3">
            <div className="shrink-0 relative">
                <img
                className="rounded-full w-11 h-11"
                src="/docs/images/people/profile-picture-3.jpg"
                alt="Bonnie"
                />
                <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800">
                <svg
                    className="w-2 h-2 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                >
                    <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                </svg>
                </div>
            </div>
            <div className="w-full ps-3">
                <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                    Bonnie Green
                </span>{" "}
                and{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                    141 others
                </span>{" "}
                love your story. See it and view more stories.
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                44 minutes ago
                </div>
            </div>
            </div>

            {/* User item 4 */}
            <div className="flex px-4 py-3">
            <div className="shrink-0 relative">
                <img
                className="rounded-full w-11 h-11"
                src="/docs/images/people/profile-picture-3.jpg"
                alt="Bonnie"
                />
                <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800">
                <svg
                    className="w-2 h-2 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                >
                    <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                </svg>
                </div>
            </div>
            <div className="w-full ps-3">
                <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                    Bonnie Green
                </span>{" "}
                and{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                    141 others
                </span>{" "}
                love your story. See it and view more stories.
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                44 minutes ago
                </div>
            </div>
            </div>

            {/* User item 5 */}
        <div className="flex px-4 py-3">
            <div className="shrink-0 relative">
                <img
                className="rounded-full w-11 h-11"
                src="/docs/images/people/profile-picture-3.jpg"
                alt="Bonnie"
                />
                <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800">
                <svg
                    className="w-2 h-2 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                >
                    <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                </svg>
                </div>
            </div>
            <div className="w-full ps-3">
                <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                    Bonnie Green
                </span>{" "}
                and{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                    141 others
                </span>{" "}
                love your story. See it and view more stories.
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                44 minutes ago
                </div>
            </div>
            </div>

            {/* Add other user items similarly */}
        </div>
        </div>
    );
    };

    export default UserListStatic;