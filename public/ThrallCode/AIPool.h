// Simple object pool pattern
#pragma once

template<typename T>
class ObjectPool {
public:
  T* Acquire();
  void Release(T* obj);
private:
  std::vector<T*> freeList;
};

// usage:
// Agent* a = pool.Acquire();
// pool.Release(a);
