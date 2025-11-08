import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  title: string;
  account: string;
  note: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  icon: string;
  categoryId: string;
  subcategoryId?: string;
  userId?: string;
}

const TRANSACTIONS_KEY = '@transactions';

export class StorageService {
  // Get all transactions
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  // Save all transactions
  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  // Add a single transaction
  static async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }

  // Update a transaction
  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        await this.saveTransactions(transactions);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }

  // Delete a transaction
  static async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await this.saveTransactions(filtered);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  // Add multiple transactions (for batch)
  static async addBatchTransactions(newTransactions: Transaction[]): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(...newTransactions);
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding batch transactions:', error);
    }
  }

  // Clear all data (for testing)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TRANSACTIONS_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}