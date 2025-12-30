import * as React from "react";
import PropTypes from "prop-types";

import { cn } from "./utils";

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-3xl border",
        className,
      )}
      {...props}
    />
  );
}

Card.propTypes = { className: PropTypes.string };

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-4 pt-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

CardHeader.propTypes = { className: PropTypes.string };

function CardTitle({ className, ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

CardTitle.propTypes = { className: PropTypes.string };

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

CardDescription.propTypes = { className: PropTypes.string };

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

CardAction.propTypes = { className: PropTypes.string };

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 last:pb-4 border-gray-500", className)}
      {...props}
    />
  );
}

CardContent.propTypes = { className: PropTypes.string };

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 pb-4 [.border-t]:pt-4", className)}
      {...props}
    />
  );
}

CardFooter.propTypes = { className: PropTypes.string };

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};


