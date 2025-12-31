import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Calendar, FileText, Image as ImageIcon, Package } from "lucide-react";

export default function CheckoutDetailsDialog({ isOpen, onOpenChange, selectedCheckout }) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange} >
			<DialogContent className="mx-4 m-auto bg-gray-100 max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Checkout Details</DialogTitle>
					<DialogDescription>
						View complete information about this equipment checkout
					</DialogDescription>
				</DialogHeader>

				{selectedCheckout && (
					<div className="space-y-6 mt-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Equipment Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3">
									<Package className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Equipment</div>
										<div className="font-semibold">{selectedCheckout.equipmentName}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Calendar className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Checked Out</div>
										<div className="font-semibold">{selectedCheckout.checkedOutAt}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Calendar className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Due Date</div>
										<div className="font-semibold">{selectedCheckout.dueDate}</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* User Information */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Borrower Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3">
									<User className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Name</div>
										<div className="font-semibold">{selectedCheckout.userName}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Mail className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Email</div>
										<div className="font-semibold">{selectedCheckout.userEmail}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Phone className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Phone</div>
										<div className="font-semibold">{selectedCheckout.userPhone}</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Checkout Details */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Checkout Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3">
									<MapPin className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Destination</div>
										<div className="font-semibold">{selectedCheckout.destination}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<FileText className="h-5 w-5 text-gray-400" />
									<div>
										<div className="text-sm text-gray-600">Purpose</div>
										<div className="font-semibold">{selectedCheckout.purpose}</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Condition Photo */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<ImageIcon className="h-5 w-5" />
									Equipment Condition Photo
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<p className="text-sm text-gray-600">
										Photo captured by the user before checkout to document the equipment condition.
									</p>
									{selectedCheckout.checkoutPhoto && (
										<div className="relative rounded-lg overflow-hidden border border-gray-200">
											<img
												src={selectedCheckout.checkoutPhoto}
												alt="Equipment condition at checkout"
												className="w-full h-auto object-cover"
												onError={(e) => {
													e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
												}}
											/>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

