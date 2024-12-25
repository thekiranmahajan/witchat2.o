import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  type,
  fieldName,
  placeholder,
  label,
  icon: Icon,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
}) => {
  return (
    <div className="form-control">
      <label htmlFor={fieldName} className="label">
        <span className="label-text font-medium capitalize">{label}</span>
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="size-5 text-base-content/40" />
        </div>
        <input
          type={type}
          id={fieldName}
          className="input input-bordered w-full pl-10"
          placeholder={placeholder}
          value={formData[fieldName]}
          onChange={(e) => {
            setFormData({ ...formData, [fieldName]: e.target.value });
          }}
          autoCapitalize={fieldName === "email" ? "none" : undefined}
        />
        {label == "Password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="size-5 text-base-content/40" />
            ) : (
              <Eye className="size-5 text-base-content/40" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
