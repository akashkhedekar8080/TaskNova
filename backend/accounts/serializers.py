# accounts/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user information to the response
        user_data = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "is_staff": self.user.is_staff,
            "is_superuser": self.user.is_superuser,
            "is_admin": self.user.is_staff
            or self.user.is_superuser,  # Custom admin check
            "date_joined": self.user.date_joined,
            "last_login": self.user.last_login,
        }

        # Add custom user fields if you have them
        if hasattr(self.user, "profile"):
            user_data.update(
                {
                    "avatar": self.user.profile.avatar.url
                    if self.user.profile.avatar
                    else None,
                    "phone": getattr(self.user.profile, "phone", None),
                    "role": getattr(
                        self.user.profile, "role", "user"
                    ),  # Custom role field
                }
            )

        data["user"] = user_data
        return data
