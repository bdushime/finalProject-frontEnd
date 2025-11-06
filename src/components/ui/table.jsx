import * as React from "react";
import PropTypes from "prop-types";

import { cn } from "./utils";

function Table({ className, ...props }) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto border-separate border-spacing-y-2 border-spacing-x-0"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

Table.propTypes = {
  className: PropTypes.string,
};

function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b bg-[#BEBEE0] text-white", className)}
      {...props}
    />
  );
}

TableHeader.propTypes = { className: PropTypes.string };

function TableBody({ className, ...props }) {
  return (
    <tbody data-slot="table-body" className={className} {...props} />
  );
}

TableBody.propTypes = { className: PropTypes.string };

function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

TableFooter.propTypes = { className: PropTypes.string };

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors bg-gray-100 text-center justify-center items-center",
        className,
      )}
      {...props}
    />
  );
}

TableRow.propTypes = { className: PropTypes.string };

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-center align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

TableHead.propTypes = { className: PropTypes.string };

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap items-center text-center justify-center",
        className,
      )}
      {...props}
    />
  );
}

TableCell.propTypes = { className: PropTypes.string };

function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

TableCaption.propTypes = { className: PropTypes.string };

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};


