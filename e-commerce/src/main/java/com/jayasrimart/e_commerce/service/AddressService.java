package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.AddressDto;
import com.jayasrimart.e_commerce.entity.Address;
import com.jayasrimart.e_commerce.entity.User;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.AddressRepository;
import com.jayasrimart.e_commerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(Long userId, AddressDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        boolean isFirst = existing.isEmpty();

        Address address = new Address();
        address.setUser(user);
        address.setFullName(dto.getFullName().trim());
        address.setPhone(dto.getPhone().trim());
        address.setAddressLine1(dto.getAddressLine1().trim());
        address.setAddressLine2(dto.getAddressLine2());
        address.setCity(dto.getCity().trim());
        address.setState(dto.getState().trim());
        address.setPostalCode(dto.getPostalCode().trim());
        address.setCountry(dto.getCountry() != null ? dto.getCountry().trim() : "India");

        boolean makeDefault = dto.isDefault() || isFirst;
        if (makeDefault) {
            existing.forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }
        address.setDefault(makeDefault);

        address = addressRepository.save(address);
        return toDto(address);
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, AddressDto dto) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        address.setFullName(dto.getFullName().trim());
        address.setPhone(dto.getPhone().trim());
        address.setAddressLine1(dto.getAddressLine1().trim());
        address.setAddressLine2(dto.getAddressLine2());
        address.setCity(dto.getCity().trim());
        address.setState(dto.getState().trim());
        address.setPostalCode(dto.getPostalCode().trim());
        if (dto.getCountry() != null) address.setCountry(dto.getCountry().trim());

        if (dto.isDefault() && !address.isDefault()) {
            List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            existing.forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
            address.setDefault(true);
        }

        address = addressRepository.save(address);
        return toDto(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDto setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        existing.forEach(a -> {
            a.setDefault(false);
            addressRepository.save(a);
        });

        address.setDefault(true);
        address = addressRepository.save(address);
        return toDto(address);
    }

    public AddressDto toDto(Address address) {
        AddressDto dto = new AddressDto();
        dto.setId(address.getId());
        dto.setFullName(address.getFullName());
        dto.setPhone(address.getPhone());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setDefault(address.isDefault());
        return dto;
    }
}
