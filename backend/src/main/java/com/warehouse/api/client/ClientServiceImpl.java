package com.warehouse.api.client;

import com.warehouse.enums.ClientType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService{

    private final ClientRepository clientRepository;

    @Override
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }
    @Override
    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }
    @Override
    public Optional<Client> getClientByEmail(String email) {
        return clientRepository.findByEmail(email);
    }
    @Override
    public Client createClient(Client client) {
        if (clientRepository.existsByEmail(client.getEmail())) {
            throw new RuntimeException("Client email already exists");
        }
        return clientRepository.save(client);
    }
    @Override
    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        client.setName(clientDetails.getName());
        client.setEmail(clientDetails.getEmail());
        client.setPhone(clientDetails.getPhone());
        client.setAddress(clientDetails.getAddress());
        client.setType(clientDetails.getType());

        return clientRepository.save(client);
    }
    @Override
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        clientRepository.delete(client);
    }
    @Override
    public List<Client> getClientsByType(ClientType type) {
        return clientRepository.findByType(type);
    }
    @Override
    public List<Client> searchClientsByName(String name) {
        return clientRepository.findByNameContaining(name);
    }
    @Override
    public List<Client> searchClientsByPhone(String phone) {
        return clientRepository.findByPhoneContaining(phone);
    }
    @Override
    public boolean existsByEmail(String email) {
        return clientRepository.existsByEmail(email);
    }
}