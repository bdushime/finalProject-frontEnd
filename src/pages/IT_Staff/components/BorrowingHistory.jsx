import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/common/PaginationControls";


function BorrowingHistory({ history }) {

  const effectivePageSize = 10;

  // Use pagination hook
  const {
    totalPages,
    currentPage,
    paginatedItems: currentHistory,
  } = usePagination(history, page, effectivePageSize);

  return (
    <div className="mt-8">
        <h3 className="font-semibold mb-3 text-base">Borrowing history</h3>

        {history.length === 0 ? (
            <p className="text-sm text-neutral-500">
            No borrowing records found for this equipment.
            </p>
        ) : (
            <>
            <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200">
                <table className="min-w-max w-full text-sm table-auto">
                <thead className="bg-neutral-50">
                    <tr>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600">Borrower</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600">Borrowed At</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600">Due Date</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600">Returned At</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {history.map(entry => (
                    <tr key={entry.borrowId} className="border-t border-neutral-200">
                        <td className="px-4 py-2">
                        <div className="flex flex-col">
                            <span className="font-medium">{entry.borrowerName}</span>
                            <span className="text-xs text-neutral-500">{entry.borrowerId}</span>
                        </div>
                        </td>

                        <td className="px-4 py-2">{new Date(entry.borrowedAt).toLocaleString()}</td>

                        <td className="px-4 py-2">{new Date(entry.dueDate).toLocaleString()}</td>

                        <td className="px-4 py-2">
                        {entry.returnedAt
                            ? new Date(entry.returnedAt).toLocaleString()
                            : "Not yet returned"}
                        </td>

                        <td className="px-4 py-2 capitalize">{entry.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
                {history.map(entry => (
                <div
                    key={entry.borrowId}
                    className="p-4 rounded-xl border border-neutral-200 shadow-sm bg-white"
                >
                    <div className="flex justify-between items-center mb-2">
                    <div>
                        <p className="font-semibold">{entry.borrowerName}</p>
                        <p className="text-xs text-neutral-500">{entry.borrowerId}</p>
                    </div>

                    <span
                        className={`px-2 py-1 text-xs rounded-full capitalize ${
                        entry.status === "returned"
                            ? "bg-green-100 text-green-700"
                            : entry.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                        {entry.status}
                    </span>
                    </div>

                    <div className="text-sm space-y-1">
                    <p>
                        <span className="font-medium">Borrowed:</span>{" "}
                        {new Date(entry.borrowedAt).toLocaleString()}
                    </p>

                    <p>
                        <span className="font-medium">Due:</span>{" "}
                        {new Date(entry.dueDate).toLocaleString()}
                    </p>

                    <p>
                        <span className="font-medium">Returned:</span>{" "}
                        {entry.returnedAt
                        ? new Date(entry.returnedAt).toLocaleString()
                        : "Not yet returned"}
                    </p>
                    </div>
                </div>
                ))}
            </div>
            </>
        )}
    </div>

  )
}

export default BorrowingHistory