from django.contrib.auth.models import User
from rest_framework import serializers

#SignUp: create user in auth_user
class SignUp(serializers.ModelSerializer):
    # field definitions
    username = serializers.CharField(
        allow_blank=False,
        trim_whitespace=True,
        allow_null=False,
        max_length=150,
        min_length=3,
        required=True,
        error_messages={
            "max_length": "Username must be less than 150",
            "min_length": "Username must be at least 3 characters",
            "required": "Username is required",
            "blank": "Username can't be blank",
            "allow_null": "Username can't be null",
        }
    )
    email = serializers.EmailField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        allow_null=False,
        error_messages={
            "required": "Email is required",
            "blank": "Email is required",
            "null": "Email is required",
            "invalid": "Email is invalid",
        }
    )
    password = serializers.CharField(
        required=True,
        allow_null=False,
        allow_blank=False,
        write_only=True,
        min_length=8,
        error_messages={
            "required": "Email is required",
            "blank": "Email is required",
            "null": "Email is required",
            "min_length": "Password must be at least 8 characters",
        }
    )

    confirmPassword = serializers.CharField(
        required=True,
        allow_null=False,
        allow_blank=False,
        write_only=True,
        min_length=8,
        error_messages={
            "required": "Email is required",
            "blank": "Email is required",
            "null": "Email is required",
            "min_length": "Password must be at least 8 characters",
        }
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is taken")
        return value
    # check if two passwords match
    def validate(self, data):
        password = data["password"]
        confirmPassword = data["confirmPassword"]
        if password != confirmPassword:
            raise serializers.ValidationError({"password":"Passwords do not match"})
        return data

    class Meta:
        model = User
        fields = ["email", "password", "username", "confirmPassword"]

