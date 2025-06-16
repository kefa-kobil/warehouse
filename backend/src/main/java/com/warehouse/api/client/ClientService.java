package com.warehouse.api.client;

import com.warehouse.enums.ClientType;

import java.util.List;
import java.util.Optional;

public interface ClientService {

    public List<Client> getAllClients();

    public Optional<Client> getClientById(Long id);

    public Optional<Client> getClientByEmail(String email);

    public Client createClient(Client client);

    public Client updateClient(Long id, Client clientDetails);
    public void deleteClient(Long id);

    public List<Client> getClientsByType(ClientType type);

    public List<Client> searchClientsByName(String name);

    public List<Client> searchClientsByPhone(String phone);

    public boolean existsByEmail(String email);
}