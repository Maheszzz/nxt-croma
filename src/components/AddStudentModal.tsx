"use client";

import React from "react";
import { useForm, FieldError } from "react-hook-form";
import { X } from "lucide-react";

// Define types for props
interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: StudentData) => void;
}

// Define types for form data
interface StudentData {
  firstname: string;
  lastname: string;
  age: number;
  phone: string;
  mail: string;
  role: string;
  date: string;
}

interface FormInputs {
  firstname: string;
  lastname: string;
  age: string; // initially string from input, converted later
  phone: string;
  mail: string;
  role: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>();

  const onSubmit = (data: FormInputs) => {
    onAddStudent({
      ...data,
      date: new Date().toISOString(),
      age: parseInt(data.age, 10),
    });
    reset(); // clears the form
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              id="modal-title"
              className="text-xl font-bold text-gray-900 font-sans"
            >
              Add New Student
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100/50 rounded-full transition-colors"
              aria-label="Close modal"
              type="button"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {["firstname", "lastname", "age", "phone", "mail", "role"].map(
              (field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700 mb-2 capitalize font-sans"
                  >
                    {field === "mail" ? "Email" : field}
                  </label>

                  <input
                    id={field}
                    type={
                      field === "age"
                        ? "number"
                        : field === "mail"
                        ? "email"
                        : "text"
                    }
                    {...register(field as keyof FormInputs, {
                      required: `${
                        field === "mail" ? "Email" : field
                      } is required`,
                      ...(field === "mail" && {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email format",
                        },
                      }),
                      ...(field === "phone" && {
                        pattern: {
                          value: /^[0-9\s\-()]{7,15}$/,
                          message: "Phone must be 7–15 digits",
                        },
                      }),
                      ...(field === "age" && {
                        min: {
                          value: 1,
                          message: "Age must be greater than 0",
                        },
                      }),
                    })}
                    className={`w-full px-3 py-2 bg-gray-50/50 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 font-sans text-sm ${
                      errors[field as keyof FormInputs]
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder={`Enter ${
                      field === "mail"
                        ? "email"
                        : field === "phone"
                        ? "phone number (e.g., 123-456-7890)"
                        : field
                    }`}
                    aria-invalid={!!errors[field as keyof FormInputs]}
                    aria-describedby={
                      errors[field as keyof FormInputs]
                        ? `${field}-error`
                        : undefined
                    }
                  />

                  {errors[field as keyof FormInputs] && (
                    <p
                      id={`${field}-error`}
                      role="alert"
                      className="mt-2 text-sm text-red-600 font-sans"
                    >
                      {/* TypeScript fix: errors[field] can be FieldError or undefined, render only message string */}
                      {(errors[field as keyof FormInputs] as FieldError).message}
                    </p>
                  )}
                </div>
              )
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors font-medium font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-600 text-white rounded-lg hover:from-gray-700 hover:to-gray-700 transition-all font-medium font-sans"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
