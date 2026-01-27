from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate



User = get_user_model()
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
            "required": "Password is required",
            "blank": "Password is required",
            "null": "Password is required",
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
            "required": "Password is required",
            "blank": "Password is required",
            "null": "Password is required",
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
            raise serializers.ValidationError("Passwords do not match")
        return data

    class Meta:
        model = User
        fields = ["email", "password", "username", "confirmPassword"]

class ResetPassword(serializers.Serializer):
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

    def validate_email(self, value):
        if not User.objects.filter(email=value, account_type="manual").exists():
            raise serializers.ValidationError("Email provided doesn't exist")
        return value

class ConfirmResetPassword(serializers.ModelSerializer):
    password = serializers.CharField(
        required=True,
        allow_null=False,
        allow_blank=False,
        write_only=True,
        min_length=8,
        error_messages={
            "required": "Password is required",
            "blank": "Password is required",
            "null": "Password is required",
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
            "required": "Confirm Password is required",
            "blank": "Confirm Password is required",
            "null": "Confirm Password is required",
            "min_length": "Confirm Password must be at least 8 characters",
        }
    )

    id = serializers.CharField(
        required=True,
        allow_null=False,
        allow_blank=False,
        write_only=True,
        error_messages={
            "required": "id is required",
            "blank": "id is required",
            "null": "id is required",
        }
    )

    token = serializers.CharField(
        required=True,
        allow_null=False,
        allow_blank=False,
        write_only=True,
        error_messages={
            "required": "token is required",
            "blank": "token is required",
            "null": "token is required",
        }
    )

    def validate_id(self, value):
        # make sure id is valid and can be used to find user
        try:
            decoded_bytes = urlsafe_base64_decode(value)
            id = int(decoded_bytes.decode("utf-8"))
            if not User.objects.filter(id=id, account_type="manual").exists():
                raise serializers.ValidationError("This user doesn't exist")
        except Exception as e:
            raise serializers.ValidationError("This user doesn't exist")
        return id

    def validate(self, data):
        # check if two passwords match
        password = data["password"]
        confirmPassword = data["confirmPassword"]
        user_id = data["id"]
        token = data["token"]
        user = User.objects.get(id=user_id)
        if password != confirmPassword:
            raise serializers.ValidationError("Passwords do not match")

        # check if the token is valid
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            raise serializers.ValidationError("token is invalid")

        return data

    class Meta:
        model = User
        fields = ["password", "confirmPassword", "id", "token"]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attr):
        username = attr.get("username")
        password = attr.get("password")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid username or password")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid username or password")

        if not user.is_active:
            raise AuthenticationFailed("This account is inactive")

        #  if it passes your custom validations,
        # then pass it to django to validate again
        # and return {"access": ..., "refresh": ..}
        data = super().validate(attr)
        return data
